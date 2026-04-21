import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'qzy-button-option',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './button-option.component.html',
  styleUrl: './button-option.component.scss',
})
export class ButtonOptionComponent {
  @Input() label: string = '';
}
