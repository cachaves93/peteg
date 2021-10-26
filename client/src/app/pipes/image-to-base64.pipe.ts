import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, Subscriber } from 'rxjs';

@Pipe({
  name: 'imageToBase64'
})
export class ImageToBase64Pipe implements PipeTransform {

  transform(image: File | null, ...args: unknown[]): Observable<string> {
    if (!image) return of('');
    const reader = new FileReader()
    reader.readAsDataURL(image);
    const type = image.type;
    return new Observable(
      (subscriber: Subscriber<string>) => {
        reader.onload = (ev: ProgressEvent<EventTarget>) => {
          subscriber.next(`${reader.result}`)
        }
        reader.onerror = (ev: ProgressEvent<EventTarget>) => {
          subscriber.next('')
        }
      }
    )
  }

  async transformAsync(image: File): Promise<string> {
    return new Promise(
      (resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(image);
        const type = image.type;
        reader.onload = (ev: ProgressEvent<EventTarget>) => {
          resolve(`${reader.result}`)
        }
        reader.onerror = (ev: ProgressEvent<EventTarget>) => {
          reject('')
        }
      }
    )
  }

}
