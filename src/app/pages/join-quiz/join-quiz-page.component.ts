import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClientJoinDetails, QuizJoinService } from './quiz-join.service';
import { race, take, tap, timer } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

/** Délai max. pour recevoir `joinDetails` après `join` (sinon code / session invalides). */
const JOIN_ACK_MS = 12_000;

@Component({
  selector: 'qzy-join-quiz-page',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './join-quiz-page.component.html',
  styleUrl: './join-quiz-page.component.scss',
})
export class JoinQuizPageComponent implements OnInit {
  private readonly quizJoinService = inject(QuizJoinService);
  status$ = this.quizJoinService.status$;
  quizDetails?: ClientJoinDetails;
  question$ = this.quizJoinService.question$;

  @Input() id!: string;

  /**
   * - checking: en attente de `joinDetails` ou timeout
   * - joined: session reconnue, affichage du flux habituel
   * - unavailable: pas de réponse serveur (code faux, pas d’hôte, etc.)
   */
  joinPhase: 'checking' | 'joined' | 'unavailable' = 'checking';

  ngOnInit() {
    const code = this.id?.trim();
    if (!code) {
      this.joinPhase = 'unavailable';
      return;
    }

    race([
      this.quizJoinService.joinDetails$.pipe(
        take(1),
        tap((details) => {
          this.quizDetails = details;
          this.joinPhase = 'joined';
        })
      ),
      timer(JOIN_ACK_MS).pipe(
        tap(() => {
          if (this.joinPhase === 'checking') {
            this.joinPhase = 'unavailable';
          }
        })
      ),
    ]).subscribe();

    this.quizJoinService.joinQuiz(code);
  }
}
