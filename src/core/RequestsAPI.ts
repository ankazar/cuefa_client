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

  static GetTournamentListByUserId(userId: number){
    return [
      { 
        id: 1,
        name: 'Ежедневный турнир', 
        players: '128/256', 
        prize: '1,000 ₽',
        entry: 'Бесплатно',
        status: 'available',
        time: '15:00',
        duration: '2 часа',
        rules: 'Лучший из 3 раундов',
        prizeDistribution: ['1 место: 500 ₽', '2 место: 300 ₽', '3 место: 200 ₽']
      },
      { 
        id: 2,
        name: 'Недельный кубок', 
        players: '64/128', 
        prize: '5,000 ₽',
        entry: '50 ₽',
        status: 'available',
        time: 'Завтра 20:00',
        duration: '4 часа',
        rules: 'Double Elimination',
        prizeDistribution: ['1 место: 2,500 ₽', '2 место: 1,500 ₽', '3-4 место: 500 ₽']
      },
      { 
        id: 3,
        name: 'Месячный чемпионат', 
        players: '32/64', 
        prize: '25,000 ₽',
        entry: '200 ₽',
        status: 'ongoing',
        time: 'Идет сейчас',
        duration: '6 часов',
        rules: 'Round Robin + Playoffs',
        prizeDistribution: ['1 место: 12,500 ₽', '2 место: 7,500 ₽', '3 место: 5,000 ₽']
      },
      { 
        id: 4,
        name: 'Королевская битва', 
        players: '256/512', 
        prize: '10,000 ₽',
        entry: '25 ₽',
        status: 'completed',
        time: 'Завершен',
        duration: '3 часа',
        rules: 'Battle Royale',
        prizeDistribution: ['1 место: 5,000 ₽', '2 место: 3,000 ₽', '3 место: 2,000 ₽']
      }
    ];
  }
}