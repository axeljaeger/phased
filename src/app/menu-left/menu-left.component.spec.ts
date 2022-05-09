import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuLeftComponent } from './menu-left.component';
import * as menuLeft from './menu-left.metadata' ;

describe('MenuLeftComponent', () => {
  let component: MenuLeftComponent;
  let fixture: ComponentFixture<MenuLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(menuLeft.moduleMetaData)
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
