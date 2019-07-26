import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Config } from './types';

@Injectable()
export class ConfigService {
    private configUrl = '/assets/config.json';

    constructor(private http: HttpClient) { }

    getConfig(): Promise<Config> {
        let url = window.location.origin + this.configUrl;
        return this.http.get<Config>(url).toPromise()
        .then(response => {
            return response;
        })
        .catch(error => {
            throw new HttpErrorResponse(error);
        });
    }
}