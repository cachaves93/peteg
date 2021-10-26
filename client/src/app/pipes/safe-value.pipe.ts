import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeValue'
})
export class SafeValuePipe implements PipeTransform {

  constructor(
    private domSanitizer: DomSanitizer
  ) {}

  transform(value: string | null, ...args: unknown[]): SafeUrl | null {
    if (!value) return null;
    return this.domSanitizer.bypassSecurityTrustUrl(value)
  }

}
