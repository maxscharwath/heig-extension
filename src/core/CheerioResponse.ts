import * as cheerio from 'cheerio';
import { CheerioAPI } from 'cheerio';

export default class CheerioResponse extends Response {
  $!: CheerioAPI;

  constructor(body: BodyInit | null, init?: ResponseInit, $?: CheerioAPI) {
    super(body, init);
    if ($) {
      this.$ = $;
    } else if (body) this.$ = cheerio.load(body as string);
  }

  static async from(response: Response): Promise<CheerioResponse> {
    const data = await response.clone()
      .text();
    return new CheerioResponse(data, response);
  }

  clone(): CheerioResponse {
    return new CheerioResponse(this.body, this, this.$);
  }
}
