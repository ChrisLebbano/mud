export class LoginTokenGenerator {

    public generate(): string {
        const randomSegment = Math.random().toString(36).slice(2, 10);
        const timeSegment = Date.now().toString(36);
        return `${timeSegment}-${randomSegment}`;
    }

}

