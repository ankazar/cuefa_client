import { UserService } from '../core/UserService';
export class RequestsAPI {

  static GetTournamentDataById(id: number){
    return this.GetTournamentListForUser().find(t => t.id === id);
  }

  static GetTournamentListForUser(){
    const userId = UserService.getUserId();
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
        prizeDistribution: ['1 место: 500 ₽', '2 место: 300 ₽', '3 место: 200 ₽'],
        lastTour: 2,
        curTour: 1
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
        prizeDistribution: ['1 место: 2,500 ₽', '2 место: 1,500 ₽', '3-4 место: 500 ₽'],
        lastTour: 2,
        curTour: 1
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
        prizeDistribution: ['1 место: 12,500 ₽', '2 место: 7,500 ₽', '3 место: 5,000 ₽'],
        lastTour: 2,
        curTour: 1
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
        prizeDistribution: ['1 место: 5,000 ₽', '2 место: 3,000 ₽', '3 место: 2,000 ₽'],
        lastTour: 2,
        curTour: 1
      }
    ];
  }

  static async GetMatchOpponent(): Promise<any> {
    console.log('📡 Запрос данных соперника...');
    
    // Имитация задержки сети
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    // Имитация ответа от сервера
    const opponents = [
        { name: 'DragonSlayer', rating: 1580 },
        { name: 'ShadowMaster', rating: 1420 },
        { name: 'NightWolf', rating: 1650 },
        { name: 'StormBreaker', rating: 1350 },
        { name: 'PhoenixRider', rating: 1720 },
        { name: 'IceQueen', rating: 1480 }
    ];
    
    // Случайный выбор соперника
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    
    console.log('✅ Данные соперника получены:', opponent);
    return opponent;
}

    static async GetImageBase64(url: string): Promise<any> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'default'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64);
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });

    } catch (error) {
        console.error('Ошибка запроса:', error);
        throw error;
    }
}


}