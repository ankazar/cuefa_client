class UserServiceClass {
  private _userId: number | null = null;
  private _userData: any = null;

  // Установить userId
  setUserId(id: number): void {
    this._userId = id;
    console.log("👤 UserId установлен:", id);
  }

  // Получить userId
  getUserId(): number | null {
    return this._userId;
  }

  // Проверить, авторизован ли пользователь
  isAuthenticated(): boolean {
    return this._userId !== null;
  }

  // Установить данные пользователя
  setUserData(data: any): void {
    this._userData = data;
  }

  // Получить данные пользователя
  getUserData(): any {
    return this._userData;
  }

  // Очистить данные (при выходе)
  clear(): void {
    this._userId = null;
    this._userData = null;
  }
}

// Экспортируем единственный экземпляр
export const UserService = new UserServiceClass();
