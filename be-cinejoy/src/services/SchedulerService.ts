import ShowtimeService from './ShowtimeService';
import MoviesService from './MoviesService';

class SchedulerService {
  private showtimeService: ShowtimeService;
  private moviesService: MoviesService;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private movieStatusInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.showtimeService = new ShowtimeService();
    this.moviesService = new MoviesService();
  }

  startCleanupScheduler(): void {
    this.cleanupInterval = setInterval(async () => {
      try {
        const result = await this.showtimeService.releaseExpiredReservations();
        
      } catch (error) {
        console.error('❌ Error during scheduled cleanup:', error);
      }
    }, 2 * 60 * 1000); // 2 minutes

  }

  // Dừng scheduled job
  stopCleanupScheduler(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  // Bắt đầu scheduled job để cập nhật trạng thái phim
  startMovieStatusScheduler(): void {
    // Chạy mỗi ngày lúc 00:00 để cập nhật trạng thái phim
    this.movieStatusInterval = setInterval(async () => {
      try {
        const result = await this.moviesService.updateMovieStatuses();
        
      } catch (error) {
        console.error('❌ Error during scheduled movie status update:', error);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours

  }

  // Dừng scheduled job cập nhật trạng thái phim
  stopMovieStatusScheduler(): void {
    if (this.movieStatusInterval) {
      clearInterval(this.movieStatusInterval);
      this.movieStatusInterval = null;
    }
  }

  // Chạy cập nhật trạng thái phim ngay lập tức (cho testing)
  async runMovieStatusUpdateNow(): Promise<{ updated: number; message: string }> {
    return await this.moviesService.updateMovieStatuses();
  }

  // Bắt đầu tất cả scheduled jobs
  startAllSchedulers(): void {
    this.startCleanupScheduler();
    this.startMovieStatusScheduler();
  }

  // Dừng tất cả scheduled jobs
  stopAllSchedulers(): void {
    this.stopCleanupScheduler();
    this.stopMovieStatusScheduler();
  }

  // Chạy cleanup ngay lập tức (cho testing)
  async runCleanupNow(): Promise<{ released: number }> {
    return await this.showtimeService.releaseExpiredReservations();
  }
}

export default SchedulerService;
