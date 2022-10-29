import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuLeftComponent } from './sidebar-container';
import * as menuLeft from './sidebar-container.metadata' ;

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
