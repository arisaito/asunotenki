export class DataProcessor {
  year: number;
  month: number;
  day: number;
  cityNumber: number;

  constructor() {}

  private generateKey(date: number, city: string): number {
    this.cityNumber = this.convertCityToNumber(city);
    const uniqueNumber = date + this.cityNumber;
    return uniqueNumber;
  }

  private convertCityToNumber(city: string): number {
    let result = 0;
    for (let i = 0; i < city.length; i++) {
      result += city.charCodeAt(i);
    }
    return result;
  }

  private getDate(): number {
    const today = new Date();
    this.year = today.getFullYear();
    this.month = today.getMonth() + 1;
    this.day = today.getDate();
    // console.log("date: " + this.year + "/" + this.month + "/" + this.day);
    const dateNum = this.year + this.month + this.day;
    return dateNum;
  }

  private mapToRange(
    a: number,
    b: number,
    c: number,
    d: number,
    max: number
  ): number {
    // 4つの数字を組み合わせて一意の数値を生成
    const combinedValue = a * 1000 + b * 100 + c * 10 + d;
    // 39で割った余りを求めることで、0から39の範囲に収める
    const result = Math.floor(combinedValue % max);

    return result;
  }

  public getIndex(city: string): number {
    const index = this.generateKey(this.getDate(), city);
    return index;
  }

  public getPage(maxPage: number): number {
    const mappedValue = this.mapToRange(
      this.year,
      this.month,
      this.day,
      this.cityNumber,
      maxPage
    );

    return mappedValue;
  }
}
