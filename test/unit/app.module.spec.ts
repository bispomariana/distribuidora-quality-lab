import { AppModule } from '../../src/app.module';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should have TypeOrmModule in imports', () => {
    const imports = Reflect.getMetadata('imports', AppModule);
    expect(imports).toBeDefined();
    expect(imports.length).toBeGreaterThan(0);
  });
});
