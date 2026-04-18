export class RequestsAPI {

  static GetTournamentDataById(id: number){
    console.log(`🎮 GetTournamentDataById: ${id}`);
        return {
      name: 'Ежедневный турнир',
      players: '128/256',
      prize: '1,000 ₽',
      entry: 'Бесплатно',
      status: 'available',
      time: '15:00',
      duration: '2 часа',
      rules: 'Лучший из 3 раундов',
      prizeDistribution: ['1 место: 500 ₽', '2 место: 300 ₽', '3 место: 200 ₽']
    };
  }
}