import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
    private messages: string[] = []

    saveMessage(message: string) {
        this.messages.push(message);

        // En esta parte puedes almacenar los mensages en un a base de datos
    }

    getMessages():  string[] {
        return this.messages;
    }
}
