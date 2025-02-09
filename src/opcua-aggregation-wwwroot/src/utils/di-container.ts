import 'reflect-metadata';

enum Scope {
  Singleton,
  Transient,
}

interface ServiceEntry {
  service: any;
  scope: Scope;
  instance?: any;
}

class DiContainer {
  private static instance: DiContainer;
  private services: Map<string, ServiceEntry> = new Map<string, ServiceEntry>();

  private constructor() {}

  static getInstance(): DiContainer {
    if (!DiContainer.instance) {
      DiContainer.instance = new DiContainer();
    }
    return DiContainer.instance;
  }

  registerSingleton(name: string, service: any) {
    this.services.set(name, { service, scope: Scope.Singleton });
  }

  registerTransient(name: string, service: any) {
    this.services.set(name, { service, scope: Scope.Transient });
  }

  resolve<T>(key: string): T {
    const entry = this.services.get(key);
    if (!entry) {
      throw new Error(`Service ${key} not found`);
    }

    if (entry.scope === Scope.Singleton) {
      if (!entry.instance) {
        entry.instance = this.createInstance(entry.service);
      }
      return entry.instance;
    }

    return this.createInstance(entry.service);
  }

  private createInstance(service: any): any {
    if (typeof service === 'function' && !service.prototype) {
      return service();
    }

    if (typeof service === 'function') {
      const dependencies = this.getDependencies(service);
      return new service(...dependencies);
    }

    return service;
  }

  private getDependencies(service: any): any[] {
    const dependencies =
      Reflect.getMetadata('design:paramtypes', service) || [];
    return dependencies.map((dependency: any) => this.resolve(dependency.name));
  }
}

export const container = DiContainer.getInstance();
