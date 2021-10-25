import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { take } from 'rxjs/operators';

interface PetPhoto {
  isLoading: boolean;
  src: string;
}

interface AddPetPhotoRequest {
  username: string;
  petName: string;
  petPhoto: string;
} 

interface AppMessage {
  message: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  public addPetPhotoForm: FormGroup;

  constructor(
    private httpClient: HttpClient
  ) {
    this.addPetPhotoForm = new FormGroup({
      username: new FormControl(null, [Validators.required]),
      petName: new FormControl(null, [Validators.required]),
      petPhoto: new FormControl(null, [Validators.required])
    })
  }

  public petPhotos$: BehaviorSubject<PetPhoto[]> = new BehaviorSubject<PetPhoto[]>([])

  addPetPhoto() {
    if (this.addPetPhotoForm.invalid) return
    const addPhotoRequest: AddPetPhotoRequest = {
      username: this.addPetPhotoForm.get('username')?.value,
      petName: this.addPetPhotoForm.get('petName')?.value,
      petPhoto: this.addPetPhotoForm.get('petPhoto')?.value
    }
    this.petPhotos$.next(
      [
        ...this.petPhotos$.getValue(),
        {
          isLoading: true,
          src: ''
        }
      ]
    )
    this.addPetPhotoRequest(addPhotoRequest).pipe(take(1)).subscribe(
      (appMessage: AppMessage) => {
        window.alert(appMessage);
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

  addPetPhotoRequest(addPhotoRequest: AddPetPhotoRequest): Observable<AppMessage> {
    return this.httpClient.post<AppMessage>(`${environment.apiUrl}/addPetPhoto`, addPhotoRequest)
  }


}
