import { Inject } from 'injection-js';
import { Observable } from 'rxjs';

import { PlayerModel, Repository } from '../../persistence';
import { PLAYERS_REPOSITORY_TOKEN } from '../../injection-tokens';
import { PlayersService } from './players-service';

export class PlayersServiceImpl implements PlayersService {
  constructor(@Inject(PLAYERS_REPOSITORY_TOKEN) private readonly playersRepository: Repository<PlayerModel>) {}

  public getById(id: string): Observable<PlayerModel> {
    return this.playersRepository.getById(id)
  }

  public getAll(): Observable<PlayerModel[]> {
    return this.playersRepository.getAll();
  }
}
