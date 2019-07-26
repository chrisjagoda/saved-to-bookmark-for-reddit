import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ConfigService } from './services/config.service';
import { SessionService } from './services/session.service';
import { Config } from './types/index';
import { MockLoginComponent } from '../stubs/login.component.mock';
import { MockBookmarkerComponent } from '../stubs/bookmarker.component.mock';

describe('AppComponent', () => {
  class MockChrome {}
  class MockConfigService {
    constructor(private http: any) { }
    getConfig = jasmine.createSpy('getConfig').and.returnValue(Promise.resolve(<Config>{
      userAgent: 'Test'
    }));
  }
  var configServiceSpy;
  class MockSessionService { }
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MockLoginComponent,
        MockBookmarkerComponent
      ]
    }).overrideComponent(AppComponent, {
      set: {
        providers: [
          {provide: chrome, useClass: MockChrome},
          {provide: ConfigService, useClass: MockConfigService},
          {provide: SessionService, useClass: MockSessionService}
        ]
      }
    }).compileComponents();
    configServiceSpy = new MockConfigService({get: () => Promise.resolve});
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it('should call the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.ngOnInit();
    expect(configServiceSpy.getConfig).toHaveBeenCalled();
  }));
});
