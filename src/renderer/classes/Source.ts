export default class Source {
    constructor(private readonly id: string, private readonly type: string, private readonly name: string = '') {}

    getId(): string {
        return this.id;
    }

    getName(): string {
        return this.name;
    }

    getType(): string {
        return this.type;
    }
}
