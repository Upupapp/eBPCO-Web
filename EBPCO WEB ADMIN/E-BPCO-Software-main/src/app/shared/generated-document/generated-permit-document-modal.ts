import { Component, input, output } from '@angular/core';
import { UserPortalPermitPreview } from './user-portal-permit-preview';

@Component({
  selector: 'app-generated-permit-document-modal',
  imports: [UserPortalPermitPreview],
  templateUrl: './generated-permit-document-modal.html',
  styleUrl: './generated-permit-document-modal.scss',
})
export class GeneratedPermitDocumentModal {
  readonly applicationId = input.required<string>();
  readonly closed = output<void>();

  protected close(): void {
    this.closed.emit();
  }

  protected print(): void {
    window.print();
  }
}
