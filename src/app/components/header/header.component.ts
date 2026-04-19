import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PingService, PingStatus } from '../../services/ping.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../services/auth/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'qzy-header',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  private readonly pingService = inject(PingService);
  private readonly authService = inject(AuthService);
  pingStatus$ = this.pingService.ping();
  protected readonly PingStatus = PingStatus;
  isLoggedIn$ = this.authService.isLogged$;
  userDetails$ = this.authService.userDetails$;

  logout(userMenu: HTMLDetailsElement) {
    userMenu.open = false;
    this.authService.logout();
  }
}
