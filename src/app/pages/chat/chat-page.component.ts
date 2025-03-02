import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { SocketIoService } from '../../services/socket-io.service';

interface Message {
  id?: number;
  body: string;
  author: string;
}

@Component({
  selector: 'qzy-chat',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss']
})
export class ChatPageComponent implements OnInit, OnDestroy {
  @Input() currentUser!: string;
  @Input() onLogout!: () => void;

  inputValue: string = "";
  messages: Message[] = [{ id: 1, body: "Welcome to the Nest Chat app", author: "Bot" }];
  private chatSubscription!: Subscription;

  constructor(private socketService: SocketIoService) {}

  ngOnInit() {
    this.chatSubscription = this.socketService.listenToEvent<Message>('chat')
      .subscribe((newMessage) => {
        this.messages = [...this.messages, newMessage];
      });
  }

  sendMessage(event: KeyboardEvent) {
    if (event.key !== "Enter" || !this.inputValue.trim()) return;

    const message: Message = { id: Date.now(), author: this.currentUser, body: this.inputValue.trim() };
    this.socketService.sendEvent("chat", message);
    this.inputValue = "";
  }

  logout() {
    if (this.onLogout) this.onLogout();
  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }
}
