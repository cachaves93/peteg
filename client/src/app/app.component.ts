import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';
import { ImageToBase64Pipe } from './pipes/image-to-base64.pipe';
import { SwPush } from '@angular/service-worker';

interface PetPhoto {
  isLoading: boolean;
  src: string;
  username: string;
  petName: string;
}

interface AddPetPhotoRequest {
  username: string;
  petName: string;
  src: string;
} 

interface AppMessage {
  message: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  public addPetPhotoForm: FormGroup;

  constructor(
    private httpClient: HttpClient,
    private imageToBase64Pipe: ImageToBase64Pipe,
    public swPush: SwPush
  ) {
    this.addPetPhotoForm = new FormGroup({
      username: new FormControl(null, [Validators.required]),
      petName: new FormControl(null, [Validators.required]),
      petPhoto: new FormControl(null, [Validators.required]),
      petPhotoSource: new FormControl(null, [Validators.required])
    })
  }

  public petPhotos$: BehaviorSubject<PetPhoto[]> = new BehaviorSubject<PetPhoto[]>([])

  ngOnInit(): void {
      this.getPetPhotosRequest().pipe(take(1)).subscribe(
        (petPhotos: PetPhoto[]) => this.petPhotos$.next(petPhotos),
        (err: HttpErrorResponse) => window.alert('Erro ao buscar as fotos de pets iniciais!')
      )
  }

  async addPetPhoto() {
    if (this.addPetPhotoForm.invalid) return
    const addPhotoRequest: AddPetPhotoRequest = {
      username: this.addPetPhotoForm.get('username')?.value,
      petName: this.addPetPhotoForm.get('petName')?.value,
      src: await this.imageToBase64Pipe.transformAsync(this.addPetPhotoForm.get('petPhotoSource')?.value)
    }
    this.petPhotos$.next(
      [
        ...this.petPhotos$.getValue(),
        {
          isLoading: true,
          src: await this.imageToBase64Pipe.transformAsync(this.addPetPhotoForm.get('petPhotoSource')?.value),
          username: this.addPetPhotoForm.get('username')?.value,
          petName: this.addPetPhotoForm.get('petName')?.value
        }
      ]
    )
    this.addPetPhotoRequest(addPhotoRequest).pipe(take(1)).subscribe(
      (appMessage: AppMessage) => {
        window.alert(appMessage.message);
        this.petPhotos$.next(
          this.petPhotos$.getValue().map((petPhoto: PetPhoto) => {
            petPhoto.isLoading = false;
            return petPhoto
          })
        )
      },
      (err: HttpErrorResponse) => window.alert(err.error.message)
    )
  }

  onPetPhotoChange(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.addPetPhotoForm.get('petPhotoSource')?.patchValue(file)
    }
  }

  requestSubscription(): void {
    this.swPush.requestSubscription(
      { serverPublicKey: 'BAC9Ci0uFiq9Z1G-wWg7Cb-5cAPpoBLmAKdn5JcdoWEOps_dHhgA3bideoBtQ9AMpXWLd9B6j-grqP6Bl1oWAu8' }
    ).then(
      (pushSubscription: PushSubscription) => {
        console.log(pushSubscription);
        this.registerPushSubscription(pushSubscription).pipe(take(1)).subscribe(
          (appMessage: AppMessage) => {},
          (err: HttpErrorResponse) => window.alert('Erro ao registrar notificação =/')
        )
      }
    ).catch(
      (res) => console.log(res)
    )
  }

  getPetPhotosRequest(): Observable<PetPhoto[]> {
    return this.httpClient.get<PetPhoto[]>(`${environment.apiUrl}/get-pet-photos`)
  }

  addPetPhotoRequest(addPhotoRequest: AddPetPhotoRequest): Observable<AppMessage> {
    return this.httpClient.post<AppMessage>(`${environment.apiUrl}/upload-pet-photo`, addPhotoRequest)
  }
  
  registerPushSubscription(pushSubscription: PushSubscription): Observable<AppMessage> {
    return this.httpClient.post<AppMessage>(
      `${environment.apiUrl}/upload-push-subscription`,
      { pushSubscription : pushSubscription.toJSON() }
    )
  }


}
