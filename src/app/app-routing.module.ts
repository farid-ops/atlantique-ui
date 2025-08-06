import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './theme/layout/admin/admin.component';
import { GuestComponent } from './theme/layout/guest/guest.component';
import { UtilisateursComponent } from './pages/utilisateur/utilisateurs/utilisateurs.component';
import {authGuard} from "./core/auth.guard";
import {ArmateurComponent} from "./pages/armateur/armateur.component";
import {AutoritesComponent} from "./pages/autorite/autorite.component";
import {ConsignatairesComponent} from "./pages/consignataires/consignataires.component";
import {ImportateursComponent} from "./pages/importateurs/importateurs.component";
import {NatureMarchandisesComponent} from "./pages/nature-marchandises/nature-marchandises.component";
import {NavireComponent} from "./pages/navire/navire.component";
import {TransitaireComponent} from "./pages/transitaire/transitaire.component";
import {PaysComponent} from "./pages/pays/pays.component"
import {DashAnalyticsComponent} from "./demo/dashboard/dash-analytics.component";
import {SignInComponent} from "./pages/sign-in/sign-in.component";
import {PortComponent} from "./pages/port/port.component";
import {MarchandiseComponent} from "./pages/marchandises/marchandise/marchandise.component";
import { MarchandiseDetailComponent } from './pages/marchandises/marchandise-detail/marchandise-detail.component';
import { BonExpeditionListComponent } from './pages/marchandises/bon-expedition-form/bon-expedition-list/bon-expedition-list.component';
import { MySummaryComponent } from './pages/my-summary/my-summary.component';
import { SiteSummariesComponent } from './pages/my-summary/site-summaries/site-summaries.component';
import { GroupeListComponent } from './pages/groupe/groupe-list/groupe-list.component';
import { GroupeFormComponent } from './pages/groupe/groupe-form/groupe-form.component';
import { UserListComponent } from './pages/utilisateur/user-list/user-list.component';
import {MarchandiseListComponent} from "./pages/marchandises/marchandise-list/marchandise-list.component";
import { UserDetailComponent } from './pages/utilisateur/user-detail/user-detail.component';
import { GroupDetailComponent } from './pages/groupe/groupe-detail/groupe-detail.component';
import { CashierManagementComponent } from './pages/cash-register/cashier-management/cashier-management.component';
import { RecettesComponent } from './pages/recettes/recettes.component';


const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: '/analytics',
        pathMatch: 'full'
      },
      {
        path: 'analytics',
        component: DashAnalyticsComponent
      },
      {
        path: 'armateurs',
        component: ArmateurComponent
      },
      {
        path: 'utilisateurs',
        component: UserListComponent
      },
      {
        path: 'utilisateurs/new',
        component: UtilisateursComponent
      },
      {
        path: 'utilisateurs/:id',
        component: UtilisateursComponent
      },
      {
        path: 'utilisateurs/:id/details',
        component: UserDetailComponent
      },
      {
        path: 'autorites',
        component: AutoritesComponent
      },
      {
        path: 'consignataires',
        component: ConsignatairesComponent
      },
      {
        path: 'importateurs',
        component: ImportateursComponent
      },
      {
        path: 'nature-marchandises',
        component: NatureMarchandisesComponent
      },
      {
        path: 'navires',
        component: NavireComponent
      },
      {
        path: 'transitaires',
        component: TransitaireComponent
      },
      {
        path: 'pays',
        component: PaysComponent
      },
      {
        path: 'ports',
        component: PortComponent
      },
      {
        path: 'marchandises/details/:id',
        component: MarchandiseDetailComponent
      },
      {
        path: 'marchandises',
        component: MarchandiseListComponent
      },
      {
        path: 'marchandises/new',
        component: MarchandiseComponent
      },
      {
        path: 'marchandises/:id',
        component: MarchandiseComponent
      },
      {
        path: 'bon-expeditions',
        component: BonExpeditionListComponent
      },
      {
        path: 'cash-register/my-summary',
        component: MySummaryComponent
      },
      {
        path: 'cash-register/my-summary/:date',
        component: MySummaryComponent
      },
      {
        path: 'cash-register/site-summaries',
        component: SiteSummariesComponent
      },
      {
        path: 'cash-register/site-summaries/:date',
        component: SiteSummariesComponent
      },
      {
        path: 'groupes',
        component: GroupeListComponent
      },
      {
        path: 'groupes/new',
        component: GroupeFormComponent
      },
      {
        path: 'groupes/:id',
        component: GroupeFormComponent
      },
      {
        path: 'groupes/:id/details',
        component: GroupDetailComponent
      },
      {
        path: 'cash-register/manage-cashiers',
        component: CashierManagementComponent
      },
      {
        path: 'reports',
        component: RecettesComponent,
        data: { roles: ['ADMIN', 'ADMIN_GROUPE', 'CSITE', 'CAISSIER'] }
      },
    ]
  },
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: 'login',
        component: SignInComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
