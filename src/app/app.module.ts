import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BookmarkService } from './bookmark.service';
import { ConfigService } from './config.service';
import { RedditService } from './reddit.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule
  ],
  providers: [BookmarkService, ConfigService, RedditService],
  bootstrap: [AppComponent]
})
export class AppModule { }