import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'qzy-button-submit',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './button-submit.component.html',
  styleUrl: './button-submit.component.scss',
})
export class ButtonSubmitComponent {
  @Input() label: string = '';
}
