import { Message } from './message.model';
export interface Channel {
  channelId: string;
  name: string;
  messages?: Message[];
}
