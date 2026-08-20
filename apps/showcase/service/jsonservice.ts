import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable()
export class JsonService {
    private http = inject(HttpClient);

    getVersions() {
        return this.http
            .get<any>('https://www.primefaces.org/primeng/versions.json')
            .toPromise()
            .then((res) => res.versions)
            .then((data) => data);
    }

    getAnnouncement() {
        return this.http
            .get<any>('https://www.primefaces.org/cdn/news/primeng.json')
            .toPromise()
            .then((data) => data);
    }
}
