import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
// NEW: Import the service that is causing the crash
import { GamificationService } from '../gamification/gamification.service';

describe('ProjectsController', () => {
  let controller: ProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        ProjectsService,
        // NEW: Add this mock so ProjectsService can start properly
        {
          provide: GamificationService,
          useValue: { awardProjectCompletionXp: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProjectsController>(ProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});