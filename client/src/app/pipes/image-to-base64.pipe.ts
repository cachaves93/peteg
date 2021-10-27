import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Observable, of, Subscriber } from 'rxjs';
import imageCompression from 'browser-image-compression';
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
        if ((image.size / 1024 / 1024) > 0.9) {
          imageCompression(image, {
            maxSizeMB: 0.8,
            useWebWorker: true
          }).then(
            (compressedFile: File) => {
              reader.readAsDataURL(compressedFile);
              reader.onload = (ev: ProgressEvent<EventTarget>) => {
                resolve(`${reader.result}`)
              }
              reader.onerror = (ev: ProgressEvent<EventTarget>) => {
                reject('')
              }
            }
          ).catch(
            () => reject('')
          )
        } else {
          reader.readAsDataURL(image);
          reader.onload = (ev: ProgressEvent<EventTarget>) => {
            resolve(`${reader.result}`)
          }
          reader.onerror = (ev: ProgressEvent<EventTarget>) => {
            reject('')
          }
        }
        
        
      }
    )
  }

}
