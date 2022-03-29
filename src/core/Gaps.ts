import * as cheerio from 'cheerio';
import { TypedEmitter } from 'tiny-typed-emitter';
import ky, { ResponsePromise } from 'ky';
import { KyInstance } from 'ky/distribution/types/ky';
import { CheerioAPI } from 'cheerio';
import { Input, Options } from 'ky/distribution/types/options';
import CourseInterface from '@/core/entity/CourseInterface';
import GradeInterface from '@/core/entity/GradeInterface';

type Credentials = {
  username: string;
  password: string;
};

type UserInfo = {
  birthday: Date;
  mode: string;
  lastName: string;
  firstName: string;
  orientation: string;
  phoneNumber: string;
  addressStreet: string;
  pictureId: number;
  picture: ArrayBuffer;
  id: number;
  email: string;
  addressCity: string;
  faculty: string;
};

interface CheerioResponse extends Response{
  $: CheerioAPI;
}
interface CheerioResponsePromise extends ResponsePromise{
  $: CheerioAPI;
}

export default class GAPS extends TypedEmitter<{
  loginError: (status: string) => void;
  sessionExpireSoon: (expireIn: number) => void;
}> {
  readonly #client: KyInstance;

  private readonly gapsRequest: KyInstance;

  #userId!: number;

  #baseUrl = 'https://gaps.heig-vd.ch';

  public constructor() {
    super();
    this.#client = ky.create({
      prefixUrl: this.#baseUrl,
      credentials: 'same-origin',
      hooks: {
        afterResponse: [
          async (_request, _options, response) => {
            const res = response as CheerioResponse;
            res.$ = cheerio.load(await res.text());
            return res;
          },
        ],
      },
    });

    this.gapsRequest = this.#client.extend({
      hooks: {
        afterResponse: [
          async (request, _option, response) => {
            const data = await response.text();
            let content: string = data.replace(/^s*|s*$/, '');
            const status = content[0];
            if (status === '-' || status === '+') content = content.substring(2);
            else throw new Error(content);
          },
        ],
      },
    });
  }

  private request(url: Input, options?: Options&{verify:boolean}): CheerioResponsePromise {
    return this.#client.extend({
      hooks: {
        afterResponse: [
          async (_request, _option, response) => {
            if (!options?.verify) return response;
            const res = response as CheerioResponse;
            if (res.$('#localaccessform').length > 0) {
              const statusText = res.$('.fauxLogin').text();
              this.emit('loginError', statusText);
              throw new Error(`Login failed: ${statusText}`);
            }
            return res;
          },
        ],
      },
    })(url, options) as CheerioResponsePromise;
  }

  public async loginCredentials(credentials: Credentials): Promise<boolean> {
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
      throw new Error('Unable to get userId');
    }
    this.#userId = +userIdMatch[1];
    console.log('userId', this.#userId);
    return true;
  }

  public async renewSession(): Promise<boolean> {
    try {
      const data = await this.gapsRequest('consultation/', {
        method: 'POST',
        searchParams: {
          rs: 'renewSession',
          rsargs: '[null]',
        },
      }).json();
      return data === 42;
    } catch {
      return false;
    }
  }

  public async getYearAvailable(): Promise<number[]> {
    const response = await this.request('consultation/controlescontinus/consultation.php', {
      method: 'GET',
      verify: true,
    });
    const $ = cheerio.load(await response.text());
    return $('select option')
      .toArray()
      .reduce((prev: number[], e) => {
        const val = $(e).val();
        if (val) prev.push(+val);
        return prev;
      }, [])
      .reverse();
  }

  public async getResults(year: number): Promise<CourseInterface[]> {
    const response = await this.gapsRequest('consultation/controlescontinus/consultation.php', {
      method: 'POST',
      searchParams: {
        rs: 'getStudentCCs',
        rsargs: `[${this.#userId},${year},null]`,
      },
    });
    const $ = cheerio.load(await response.text());
    const courses: CourseInterface[] = [];
    let currentHeader: number;
    let currentSection: number;
    $('tr').each((index, tr) => {
      const $tr = $(tr);
      const $header = $tr.find('td.bigheader');
      if ($header.length > 0) {
        const name = $header.text().trim().split(' - ')[0];
        const average = +$header.text().trim().split(' : ')[1];
        currentHeader = courses.length;
        courses[currentHeader] = {
          name,
          average,
          year,
          sections: [],
        };
      }

      const $section = $tr.find('td.odd, td.edge');
      if ($section.length > 0) {
        const s = $section.html()?.split('<br>');
        currentSection = courses[currentHeader].sections.length;
        if (s) {
          const name = s[0];
          const average = +s[1].trim().split(' : ')[1];
          courses[currentHeader].sections[currentSection] = {
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
        const title = $td.eq(1).find("div[id^='long']").length > 0
          ? $td.eq(1).find("div[id^='long']").text().trim()
          : $td.eq(1).text().trim();

        const grade: GradeInterface = {
          name: title,
          date: new Date(
            $td
              .eq(0)
              .text()
              .trim()
              .replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3'),
          ),
          coefficient:
            +(
              $td
                .eq(3)
                .text()
                .trim()
                .match(/\d+(?=%)/) ?? [0][0]
            ) / 100,
          grade: +$td.eq(4).text().trim(),
          average: +$td.eq(2).text().trim(),
        };

        section.grades.push(grade);
      }
    });
    return courses;
  }

  public async getInfo(): Promise<UserInfo> {
    const response = await this.gapsRequest('consultation/etudiant', {
      method: 'POST',
      searchParams: {
        rs: 'smartReplacePart',
        rsargs: `["STUDENT_SELECT_ID",null,null,null,null,${this.#userId},null]`,
      },
    });
    const $ = cheerio.load(await response.text());
    const $infos = $('#infostandard b');
    const $infosA = $('#infoacademique b');
    const pictureId = parseInt(new URL($('#photo img').attr('src') ?? '', this.#baseUrl).searchParams.get('img') ?? '', 10);

    return {
      id: this.#userId,
      lastName: $infos.eq(0).text().trim(),
      firstName: $infos.eq(1).text().trim(),
      pictureId,
      picture: await this.getPicture(pictureId),
      birthday: new Date(
        $infos
          .eq(2)
          .text()
          .trim()
          .replace(/(\d{2}).(\d{2}).(\d{4})/, '$2/$1/$3'),
      ),
      addressStreet: $infos.eq(3).text().trim(),
      addressCity: $infos.eq(4).text().trim(),
      phoneNumber: $infos.eq(5).text().trim(),
      email: $infos.eq(6).text().trim(),
      faculty: $infosA.eq(0).text().trim(),
      orientation: $infosA.eq(1).text().trim(),
      mode: $infosA.eq(2).text().trim(),
    };
  }

  private async getPicture(pictureId: number): Promise<ArrayBuffer> {
    return this.request('consultation/annuaire/displayPicture.php', {
      verify: true,
      method: 'GET',
      searchParams: {
        img: `${pictureId}.jpg`,
      },
    }).arrayBuffer();
  }
}
