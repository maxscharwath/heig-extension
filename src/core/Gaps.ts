import { CheerioAPI } from 'cheerio';
import { TypedEmitter } from 'tiny-typed-emitter';
import ky, { Options, ResponsePromise } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { Input } from 'ky/distribution/types/options';
import CourseInterface from '@/core/entity/CourseInterface';
import GradeInterface from '@/core/entity/GradeInterface';
import CheerioResponse from '@/core/CheerioResponse';
import objectHash from 'object-hash';
import browser from 'webextension-polyfill';

export type Credentials = {
  username: string;
  password: string;
};

export type UserInfo = {
  birthday: string;
  mode: string;
  lastName: string;
  firstName: string;
  orientation: string;
  phoneNumber: string;
  addressStreet: string;
  pictureId: number;
  picture: string;
  pictureUrl: string;
  id: number;
  email: string;
  addressCity: string;
  faculty: string;
};

type CheerioResponsePromise = ResponsePromise & Promise<{
  $: CheerioAPI;
}>;

export default class GAPS extends TypedEmitter<{
  loginError: (_status: string) => void;
  sessionExpireSoon: (_expireIn: number) => void;
}> {
  readonly #client: KyInstance;

  #userId?: number;

  #baseUrl = 'https://gaps.heig-vd.ch';

  public constructor() {
    super();
    this.#client = ky.create({
      prefixUrl: this.#baseUrl,
      credentials: 'same-origin',
      hooks: {
        afterResponse: [
          async (_request, _options, response) => CheerioResponse.from(response),
        ],
      },
    });
  }

  public async hasToken(): Promise<boolean> {
    try {
      await this.getToken();
      return true;
    } catch {
      return false;
    }
  }

  public async getToken(): Promise<string> {
    const cookie = await browser.cookies.get({
      url: this.#baseUrl,
      name: 'GAPSSESSID',
    });
    if (!cookie || !cookie.value) {
      throw new Error('No cookie found');
    }
    return cookie.value;
  }

  public async setToken(token: string): Promise<void> {
    await browser.cookies.set({
      url: this.#baseUrl,
      name: 'GAPSSESSID',
      value: token,
    });
  }

  public async logout() {
    await this.request('Shibboleth.sso/Logout', {
      method: 'GET',
    });
  }

  public async loginCredentials(credentials: Credentials): Promise<boolean> {
    try {
      await this.logout();
      const response = this.request('consultation/etudiant', {
        method: 'POST',
        verify: true,
        searchParams: {
          login: credentials.username,
          password: credentials.password,
          submit: 'Entrer',
        },
      });
      const data = await response.text();
      const userIdMatch = data.match(/DEFAULT_STUDENT_ID = ([0-9]+);/);
      if (!userIdMatch) {
        return false;
      }
      this.#userId = +userIdMatch[1];
      return true;
    } catch (e) {
      this.emit('loginError', `${e}`);
      return false;
    }
  }

  public async loginCookie() {
    try {
      const response = await this.request('consultation/etudiant', {
        method: 'GET',
        verify: true,
      });
      const data = await response.text();
      const userIdMatch = data.match(/DEFAULT_STUDENT_ID = ([0-9]+);/);
      if (!userIdMatch) return false;
      this.#userId = +userIdMatch[1];
      return true;
    } catch {
      return false;
    }
  }

  public async autoLogin(credentials?: Credentials) {
    if (await this.hasToken()
      && await this.renewSession()
      && (this.#userId || await this.loginCookie())
    ) {
      return true;
    }
    return credentials ? this.loginCredentials(credentials) : false;
  }

  public async renewSession(): Promise<boolean> {
    try {
      const data = await this.gapsRequest('consultation/', {
        method: 'POST',
        searchParams: {
          rs: 'renewSession',
          rsargs: '[null]',
        },
      })
        .json();
      return data === 42;
    } catch {
      return false;
    }
  }

  public async getYearAvailable(): Promise<number[]> {
    if (!this.#userId) throw new Error('Not logged in');
    const { $ } = await this.request('consultation/controlescontinus/consultation.php', {
      method: 'GET',
      verify: true,
    });
    return $('select option')
      .toArray()
      .reduce((prev: number[], e) => {
        const val = $(e)
          .val();
        if (val) prev.push(+val);
        return prev;
      }, [])
      .reverse();
  }

  public async getResults(year: number): Promise<CourseInterface[]> {
    if (!this.#userId) throw new Error('Not logged in');
    const { $ } = await this.gapsRequest('consultation/controlescontinus/consultation.php', {
      method: 'POST',
      searchParams: {
        rs: 'getStudentCCs',
        rsargs: `[${this.#userId},${year},null]`,
      },
    });
    const courses: CourseInterface[] = [];
    let currentHeader: number;
    let currentSection: number;
    $('tr')
      .each((index, tr) => {
        const $tr = $(tr);
        const $header = $tr.find('td.bigheader');
        if ($header.length > 0) {
          const name = $header.text()
            .trim()
            .split(' - ')[0];
          const hasExam = $header.text()
            .trim()
            .toLowerCase()
            .includes('examen');
          const average = +$header.text()
            .trim()
            .split(' : ')[1];
          currentHeader = courses.length;
          courses[currentHeader] = {
            uuid: objectHash({
              name,
              year,
            }),
            name,
            average,
            year,
            hasExam,
            sections: [],
          };
        }

        const $section = $tr.find('td.odd, td.edge');
        if ($section.length > 0) {
          const s = $section.html()
            ?.split('<br>');
          const course = courses[currentHeader];
          currentSection = course.sections.length;
          if (s) {
            const name = s[0];
            const average = +s[1].trim()
              .split(' : ')[1];
            courses[currentHeader].sections[currentSection] = {
              uuid: objectHash({
                name,
                year,
                course: course.uuid,
              }),
              name,
              average,
              grades: [],
              coefficient: +s[2].split(' : ')[1] / 100,
            };
          }
        }

        if ($tr.find('td.bodyCC').length > 0) {
          const section = courses[currentHeader].sections[currentSection];
          const $td = $tr.find('td');
          const title = $td.eq(1)
            .find('div[id^=\'long\']').length > 0
            ? $td.eq(1)
              .find('div[id^=\'long\']')
              .text()
              .trim()
            : $td.eq(1)
              .text()
              .trim();

          const grade: GradeInterface = {
            uuid: objectHash({
              title,
              year,
              section: section.uuid,
            }),
            name: title,
            date: new Date(
              $td
                .eq(0)
                .text()
                .trim()
                .replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3'),
            ).toISOString(),
            coefficient:
              +(
                $td
                  .eq(3)
                  .text()
                  .trim()
                  .match(/\d+(?=%)/) ?? [0][0]
              ) / 100,
            grade: +$td.eq(4)
              .text()
              .trim(),
            average: +$td.eq(2)
              .text()
              .trim(),
          };

          section.grades.push(grade);
        }
      });
    return courses;
  }

  public async getInfo(): Promise<UserInfo> {
    if (!this.#userId) throw new Error('Not logged in');
    const { $ } = await this.gapsRequest('consultation/etudiant', {
      method: 'POST',
      searchParams: {
        rs: 'smartReplacePart',
        rsargs: `["STUDENT_SELECT_ID",null,null,null,null,${this.#userId},null]`,
      },
    });
    const $infos = $('#infostandard b');
    const $infosA = $('#infoacademique b');
    const pictureId = parseInt(new URL(
      $('#photo img')
        .attr('src') ?? '',
      this.#baseUrl,
    ).searchParams.get('img') ?? '', 10);

    return {
      id: this.#userId,
      lastName: $infos.eq(0)
        .text()
        .trim(),
      firstName: $infos.eq(1)
        .text()
        .trim(),
      pictureId,
      picture: await this.getPicture(pictureId),
      pictureUrl: this.getPictureUrl(pictureId),
      birthday: new Date(
        $infos
          .eq(2)
          .text()
          .trim()
          .replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3'),
      ).toISOString(),
      addressStreet: $infos.eq(3)
        .text()
        .trim(),
      addressCity: $infos.eq(4)
        .text()
        .trim(),
      phoneNumber: $infos.eq(5)
        .text()
        .trim(),
      email: $infos.eq(6)
        .text()
        .trim(),
      faculty: $infosA.eq(0)
        .text()
        .trim(),
      orientation: $infosA.eq(1)
        .text()
        .trim(),
      mode: $infosA.eq(2)
        .text()
        .trim(),
    };
  }

  public getPictureUrl(pictureId: number): string {
    const url = new URL(this.#baseUrl);
    url.pathname = 'consultation/annuaire/displayPicture.php';
    url.searchParams.set('img', `${pictureId}.jpg`);
    return url.toString();
  }

  private request(url: Input, options: Options & { verify?: boolean, extended?: Options } = {}):
    CheerioResponsePromise {
    return this.#client.extend({
      hooks: {
        afterResponse: [
          async (_request, _option, response) => {
            if (!options?.verify) return response;
            const res = response as CheerioResponse;
            if (res.$('#localaccessform').length > 0) {
              const statusText = res.$('.fauxLogin')
                .text();
              this.emit('loginError', statusText);
              console.error(`Login error: ${statusText}`);
              throw new Error(`Login failed: ${statusText}`);
            }
            return res;
          },
        ],
      },
    })
      .extend(options?.extended ?? {})(url, options) as CheerioResponsePromise;
  }

  private gapsRequest(url: Input, options: Options & { verify?: boolean }): CheerioResponsePromise {
    return this.request(url, {
      ...options,
      extended: {
        hooks: {
          afterResponse: [
            async (request, _option, response) => {
              const data = await response.text();
              let content: string = data.replace(/^s*|s*$/, '');
              const status = content[0];
              if (status === '-' || status === '+') {
                content = content.substring(2);
              } else {
                console.error(`GAPS: ${status} ${content}`);
                throw new Error(content);
              }
              return new CheerioResponse(JSON.parse(content), response);
            },
          ],
        },
      },
    });
  }

  private async getPicture(pictureId: number): Promise<string> {
    if (!this.#userId) throw new Error('Not logged in');
    const blob = await this.request('consultation/annuaire/displayPicture.php', {
      verify: true,
      method: 'GET',
      searchParams: {
        img: `${pictureId}.jpg`,
      },
    })
      .blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
