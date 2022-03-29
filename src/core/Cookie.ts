export default class Cookie {
  public name: string;

  public value: string;

  public data: {
    [key: string]: string
  };

  constructor(private raw:string) {
    const [name, ...other] = raw.split(';').map((s) => {
      const [key, value] = s.trim().split('=');
      return { key, value };
    });
    this.name = name.key;
    this.value = name.value;
    this.data = {};
    other.forEach((item) => {
      this.data[item.key] = item.value;
    });
  }
}
