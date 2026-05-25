import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../generated/client';

// NOTE: RolesAuthGuard and Roles are available for use with @UseGuards(RolesAuthGuard)
// and @Roles(UserRole.xxx) decorators. Currently, role enforcement happens at the
// service layer (e.g., requireSupervisorRole in supervision.service.ts).
// To enable guard-based RBAC: apply @Roles() decorator on controller methods and
// add @UseGuards(RolesAuthGuard) instead of @UseGuards(SupabaseAuthGuard).

export const ROLES_KEY = 'roles';

export const Roles = (...roles: UserRole[]) => {
  return (target: any, key?: string, descriptor?: any) => {
    Reflect.defineMetadata(ROLES_KEY, roles, descriptor?.value || target);
    return target;
  };
};

@Injectable()
export class RolesAuthGuard extends AuthGuard('supabase') implements CanActivate {
  constructor(private readonly rolesReflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const jwtValid = await super.canActivate(context);
    if (!jwtValid) return false;

    const requiredRoles = this.rolesReflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    return requiredRoles.includes(request.user.role);
  }
}
