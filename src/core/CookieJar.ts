import Cookie from '@/core/Cookie';

export default class CookieJar {
  private cookies = new Map<string, Cookie>();

  public get(name: string): Cookie {
    return <Cookie> this.cookies.get(name);
  }

  public set(cookie: Cookie | string): Cookie {
    const c = typeof cookie === 'string' ? new Cookie(cookie) : cookie;
    this.cookies.set(c.name, c);
    return c;
  }
}
