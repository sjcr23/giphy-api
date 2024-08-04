import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchResponse, Gif } from '../interfaces/gifs.interfaces';


const GIPHY_API_KEY:string  = 'm05by4hRqaVr6gh4nbWLvPVB9G6Dsj9s';
const QUERY_BASE_URL:string = `https://api.giphy.com/v1/gifs`;

@Injectable({
  providedIn: 'root'
})
export class GifsService {

  private historySize = 10;
  private queryLimitSize = 10;

  private _tagsHistory: string[] = [];
  public gifList: Gif[] =[];

  constructor(private http:HttpClient) {
    this.loadLocalStorage();
    const lastSearch = this._tagsHistory.at(0);
    if (!lastSearch) return;
    this.searchTag(lastSearch);
  }

  get tagsHistory () {
    return [...this._tagsHistory];
  }

  organizeHistory(tag: string):void {
    tag = tag.toLowerCase();

    // Delete old coincidence
    if (this._tagsHistory.includes(tag)) {
      this._tagsHistory = this._tagsHistory.filter((oldTag) => oldTag !== tag);
    }

    // Re insert
    this._tagsHistory.unshift(tag);
    this._tagsHistory = this._tagsHistory.splice(0, this.historySize);
    this.saveLocalStorage();
  }

  private saveLocalStorage():void {
    localStorage.setItem('history', JSON.stringify(this._tagsHistory))
  }

  private loadLocalStorage():void {
    const temporal = localStorage.getItem('history');
    this._tagsHistory = temporal ? JSON.parse(temporal) : this._tagsHistory;
  }

  searchTag( tag: string ): void {
    // Trim avoids tags like: ' ',  '  ',  '   '.....
    if (tag.trim().length === 0 ) return;
    this.organizeHistory(tag)

    const queryParams = new HttpParams()
      .set('api_key', GIPHY_API_KEY)
      .set('limit', this.queryLimitSize)
      .set('q', tag)
      .set('rating', 'r');

    this.http.get<SearchResponse>(`${QUERY_BASE_URL}/search`, { params:queryParams })
      .subscribe(resp => {
        this.gifList = resp.data;
        console.log({ gifs: this.gifList });
      }
    );
  }
}
