import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface DebugLogsProps {
  visible: boolean;
  onToggle: () => void;
}

class DebugLogger {
  private static instance: DebugLogger;
  private logs: LogEntry[] = [];
  private listeners: ((logs: LogEntry[]) => void)[] = [];
  private originalConsole: any = {};

  private constructor() {
    this.setupConsoleInterceptor();
  }

  static getInstance(): DebugLogger {
    if (!DebugLogger.instance) {
      DebugLogger.instance = new DebugLogger();
    }
    return DebugLogger.instance;
  }

  private setupConsoleInterceptor() {
    // Store original console methods
    this.originalConsole.log = console.log;
    this.originalConsole.error = console.error;
    this.originalConsole.warn = console.warn;

    // Intercept console.log
    console.log = (...args) => {
      this.originalConsole.log(...args);
      this.addLog('info', this.formatMessage(args));
    };

    // Intercept console.error
    console.error = (...args) => {
      this.originalConsole.error(...args);
      this.addLog('error', this.formatMessage(args));
    };

    // Intercept console.warn
    console.warn = (...args) => {
      this.originalConsole.warn(...args);
      this.addLog('debug', this.formatMessage(args));
    };
  }

  private formatMessage(args: any[]): string {
    return args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    }).join(' ');
  }

  private addLog(level: LogEntry['level'], message: string, data?: any) {
    // Only capture logs that contain debug keywords
    if (message.includes('SIGNUP DEBUG') || 
        message.includes('CONNECTIVITY TEST') || 
        message.includes('HEALTH CHECK DEBUG') ||
        message.includes('API Request') ||
        message.includes('API Response') ||
        message.includes('Network Error') ||
        message.includes('API Error')) {
      
      const logEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data
      };

      this.logs.unshift(logEntry); // Add to beginning
      
      // Keep only last 50 logs
      if (this.logs.length > 50) {
        this.logs = this.logs.slice(0, 50);
      }

      this.notifyListeners();
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.logs]));
  }

  subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.notifyListeners();
  }
}

const DebugLogs: React.FC<DebugLogsProps> = ({ visible, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const debugLogger = DebugLogger.getInstance();

  useEffect(() => {
    const unsubscribe = debugLogger.subscribe(setLogs);
    setLogs(debugLogger.getLogs());
    return unsubscribe;
  }, []);

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return '#10b981';
      case 'error': return '#ef4444';
      case 'debug': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'debug': return 'info';
      default: return 'message-circle';
    }
  };

  if (!visible) {
    return (
      <TouchableOpacity
        onPress={onToggle}
        className="absolute bottom-20 right-4 bg-blue-600 rounded-full p-3 shadow-lg"
        style={{ zIndex: 1000 }}
      >
        <FeatherIcon name="monitor" size={20} color="white" />
      </TouchableOpacity>
    );
  }

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 rounded-t-3xl" style={{ height: '60%', zIndex: 1000 }}>
      <View className="flex-row items-center justify-between p-4 border-b border-gray-600">
        <Text className="text-white font-bold text-lg">Debug Logs</Text>
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => debugLogger.clearLogs()}
            className="bg-red-600 rounded-lg px-3 py-1"
          >
            <Text className="text-white text-sm">Clear</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onToggle}
            className="bg-gray-600 rounded-lg px-3 py-1"
          >
            <FeatherIcon name="x" size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {logs.length === 0 ? (
          <Text className="text-gray-400 text-center mt-8">No debug logs yet...</Text>
        ) : (
          logs.map((log) => (
            <View key={log.id} className="mb-3 p-3 bg-gray-800 rounded-lg">
              <View className="flex-row items-center mb-2">
                <FeatherIcon 
                  name={getLogIcon(log.level)} 
                  size={14} 
                  color={getLogColor(log.level)} 
                />
                <Text className="text-gray-400 text-xs ml-2">{log.timestamp}</Text>
                <View 
                  className="ml-2 px-2 py-1 rounded"
                  style={{ backgroundColor: getLogColor(log.level) + '20' }}
                >
                  <Text 
                    className="text-xs font-medium"
                    style={{ color: getLogColor(log.level) }}
                  >
                    {log.level.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text className="text-white text-sm leading-5" style={{ fontFamily: 'monospace' }}>
                {log.message}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default DebugLogs;
export { DebugLogger }; 