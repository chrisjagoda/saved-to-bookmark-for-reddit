import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BookmarkService } from './services/bookmark.service';
import { RedditService } from './services/reddit.service';
import { StorageService } from './services/storage.service';
import { LoginComponent } from './login/login.component';
import { BookmarkerComponent } from './bookmarker/bookmarker.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    BookmarkerComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [BookmarkService, RedditService, StorageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
