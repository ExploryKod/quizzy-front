import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'qzy-app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app-header.component.html',
  styleUrl: './app-header.component.scss',
})
export class AppHeaderComponent {
  @Input() showQuizMeta = true;
  @Input() quizTitle = '';
  @Input() quizIcon = 'assets/icons/icon-html.svg';
  @Input() isDarkMode = false;
  @Output() themeModeChange = new EventEmitter<boolean>();

  onToggle(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.themeModeChange.emit(isChecked);
  }
}
