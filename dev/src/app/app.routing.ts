import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { ContactComponent } from './contact/contact.component';
import { ProfileComponent } from './profile/profile.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { VisitorApproveComponent } from './visitor-approve/visitor-approve.component'
import { LoginComponent } from './login';
import { AuthGuard } from './_helpers';

const routes: Routes = [
  { path: 'home', canActivate: [AuthGuard], component: HomeComponent },
  { path: 'contact', canActivate: [AuthGuard], component: ContactComponent },
  { path: 'profile', canActivate: [AuthGuard], component: ProfileComponent },
  { path: 'checkout', canActivate: [AuthGuard], component: CheckoutComponent },
  { path: 'approve', component: VisitorApproveComponent },
  { path: 'login', component: LoginComponent },

  // otherwise redirect to home
  { path: '**', redirectTo: 'home' }
];

export const appRoutingModule = RouterModule.forRoot(routes);
