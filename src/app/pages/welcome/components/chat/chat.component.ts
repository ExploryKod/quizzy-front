import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators,ReactiveFormsModule  } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SocketIoService } from '../../../../services/socket-io.service';

import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../../services/auth/auth.service';

import { firstValueFrom } from 'rxjs';

interface Message {
  id?: number;
  body: string;
  author: string;
}

@Component({
  selector: 'qzy-chat',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, RouterLink, MatInputModule, MatButtonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);

  chatForm!: FormGroup;
  username: string = "";
  private chatSubscription!: Subscription;

  constructor(private fb: FormBuilder, private socketService: SocketIoService) {
  }

  messages: Message[] = [{ id: 1, body: `Bienvenue chez Quizzy`, author: "" }];
  async ngOnInit() {

    const details = await firstValueFrom(this.authService.userDetails$);
    this.username = details?.username || "";
   
    // ✅ Initialize FormGroup
    this.chatForm = this.fb.group({
      message: ['', [Validators.required, Validators.minLength(1)]],
    });

    // ✅ Listen for incoming messages
    this.chatSubscription = this.socketService.listenToEvent<Message>('chat')
      .subscribe((newMessage) => {
        this.messages = [...this.messages, newMessage];
      });
  }


  async sendMessage() {
    if (this.chatForm.invalid) return;

    const details = await firstValueFrom(this.authService.userDetails$);
    const username = this.username; 
  
    const message: Message = {
      id: Date.now(),
      author: username,
      body: this.chatForm.value.message.trim()
    };
  
    this.socketService.sendEvent("chat", message); 
    this.chatForm.reset(); 

  }

  ngOnDestroy() {
    if (this.chatSubscription) {
      this.chatSubscription.unsubscribe();
    }
  }

  get messageInput() {
    return this.chatForm.get('message');
  }
}
