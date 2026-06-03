import { Controller, Get, Header } from '@nestjs/common';

@Controller('metrics')
export class MetricsController {
  private readonly startTime = Date.now();

  @Get()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  getMetrics(): string {
    const uptimeSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const memoryUsage = process.memoryUsage();

    const lines: string[] = [
      '# HELP process_uptime_seconds The number of seconds the process has been running',
      '# TYPE process_uptime_seconds gauge',
      `process_uptime_seconds ${uptimeSeconds}`,
      '',
      '# HELP process_heap_bytes The size of the V8 heap in bytes',
      '# TYPE process_heap_bytes gauge',
      `process_heap_bytes{type="used"} ${memoryUsage.heapUsed}`,
      `process_heap_bytes{type="total"} ${memoryUsage.heapTotal}`,
      '',
      '# HELP process_rss_bytes Resident Set Size in bytes',
      '# TYPE process_rss_bytes gauge',
      `process_rss_bytes ${memoryUsage.rss}`,
      '',
      '# HELP process_external_bytes External memory usage in bytes',
      '# TYPE process_external_bytes gauge',
      `process_external_bytes ${memoryUsage.external}`,
      '',
      '# HELP nodejs_version_info Node.js version info',
      '# TYPE nodejs_version_info gauge',
      `nodejs_version_info{version="${process.version}"} 1`,
      '',
      '# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds',
      '# TYPE process_cpu_user_seconds_total counter',
      `process_cpu_user_seconds_total ${(process.cpuUsage().user / 1e6).toFixed(3)}`,
      '',
      '# HELP process_cpu_system_seconds_total Total system CPU time spent in seconds',
      '# TYPE process_cpu_system_seconds_total counter',
      `process_cpu_system_seconds_total ${(process.cpuUsage().system / 1e6).toFixed(3)}`,
    ];

    return lines.join('\n');
  }
}
