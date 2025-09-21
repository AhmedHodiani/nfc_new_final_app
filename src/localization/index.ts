// Arabic localization constants for the NFC Pilgrim Management App
// All text should be in Arabic with proper RTL support

export const ARABIC_TEXTS = {
  // App Title
  APP_NAME: 'نظام إدارة الحجاج بالرقاقة الذكية',
  
  // Main Actions
  START_ONBOARD: 'بدء الصعود',
  START_OFFBOARD: 'بدء النزول',
  VIEW_PILGRIMS: 'عرض قائمة الحجاج',
  SETTINGS: 'الإعدادات',
  
  // Status Labels
  ONBOARD: 'على متن الحافلة',
  OFFBOARD: 'خارج الحافلة',
  SCANNING: 'جاري المسح',
  READY: 'جاهز',
  COMPLETED: 'مكتمل',
  
  // Pilgrim Information
  FULL_NAME: 'الاسم الكامل',
  PASSPORT_NUMBER: 'رقم جواز السفر',
  SEAT_NUMBER: 'رقم المقعد',
  PHONE_NUMBER: 'رقم الهاتف',
  DATE_OF_BIRTH: 'تاريخ الميلاد',
  NATIONALITY: 'الجنسية',
  SEX: 'الجنس',
  MALE: 'ذكر',
  FEMALE: 'أنثى',
  
  // NFC Scanning
  NFC_READY: 'NFC جاهز للمسح',
  NFC_SCANNING: 'جاري مسح الرقاقة...',
  NFC_SUCCESS: 'تم المسح بنجاح',
  NFC_FAILED: 'فشل في المسح',
  PLACE_CARD: 'ضع الرقاقة بالقرب من الجهاز',
  SCAN_ANOTHER: 'امسح رقاقة أخرى',
  
  // Session Stats
  TOTAL_SCANNED: 'إجمالي الممسوحة',
  SUCCESSFUL_SCANS: 'المسح الناجح',
  FAILED_SCANS: 'المسح الفاشل',
  ONBOARD_COUNT: 'عدد الصاعدين',
  OFFBOARD_COUNT: 'عدد النازلين',
  SESSION_DURATION: 'مدة الجلسة',
  
  // Search and Filter
  SEARCH_PLACEHOLDER: 'البحث بالاسم أو رقم جواز السفر',
  FILTER_ALL: 'الكل',
  FILTER_ONBOARD: 'على متن الحافلة',
  FILTER_OFFBOARD: 'خارج الحافلة',
  SORT_BY_NAME: 'ترتيب بالاسم',
  SORT_BY_SEAT: 'ترتيب بالمقعد',
  SORT_BY_STATUS: 'ترتيب بالحالة',
  SORT_BY_UPDATED: 'ترتيب بالتحديث',
  
  // Actions
  REFRESH: 'تحديث',
  SAVE: 'حفظ',
  CANCEL: 'إلغاء',
  DELETE: 'حذف',
  EDIT: 'تعديل',
  VIEW_DETAILS: 'عرض التفاصيل',
  CLOSE: 'إغلاق',
  RETRY: 'إعادة المحاولة',
  
  // Messages
  NO_PILGRIMS_FOUND: 'لا توجد نتائج للبحث',
  LOADING: 'جاري التحميل...',
  PULL_TO_REFRESH: 'اسحب للتحديث',
  
  // Errors
  ERROR_NETWORK: 'خطأ في الاتصال بالشبكة',
  ERROR_NFC_NOT_SUPPORTED: 'الجهاز لا يدعم NFC',
  ERROR_NFC_DISABLED: 'NFC غير مفعل',
  ERROR_SCAN_TIMEOUT: 'انتهت مهلة المسح',
  ERROR_PILGRIM_NOT_FOUND: 'لم يتم العثور على الحاج',
  ERROR_ALREADY_ONBOARD: 'الحاج على متن الحافلة بالفعل',
  ERROR_ALREADY_OFFBOARD: 'الحاج خارج الحافلة بالفعل',
  ERROR_INVALID_CARD: 'رقاقة غير صالحة',
  ERROR_SERVER: 'خطأ في الخادم',
  ERROR_UNKNOWN: 'خطأ غير معروف',
  
  // Success Messages
  SUCCESS_ONBOARD: 'تم صعود الحاج بنجاح',
  SUCCESS_OFFBOARD: 'تم نزول الحاج بنجاح',
  SUCCESS_UPDATE: 'تم التحديث بنجاح',
  SUCCESS_SYNC: 'تم المزامنة بنجاح',
  
  // Confirmations
  CONFIRM_ONBOARD: 'هل تريد تأكيد صعود الحاج؟',
  CONFIRM_OFFBOARD: 'هل تريد تأكيد نزول الحاج؟',
  CONFIRM_DELETE: 'هل تريد حذف هذا الحاج؟',
  CONFIRM_RESET: 'هل تريد إعادة تعيين البيانات؟',
  
  // Instructions
  INSTRUCTION_ONBOARD: 'اضغط على زر "بدء الصعود" ثم امسح رقاقات الحجاج واحدة تلو الأخرى',
  INSTRUCTION_OFFBOARD: 'اضغط على زر "بدء النزول" ثم امسح رقاقات الحجاج واحدة تلو الأخرى',
  INSTRUCTION_NFC: 'تأكد من تفعيل NFC وضع الرقاقة بالقرب من الجهاز',
  
  // Time and Date
  SECONDS: 'ثانية',
  MINUTES: 'دقيقة',
  HOURS: 'ساعة',
  TODAY: 'اليوم',
  YESTERDAY: 'أمس',
  
  // Numbers (Arabic-Indic)
  NUMBERS: {
    0: '٠',
    1: '١',
    2: '٢',
    3: '٣',
    4: '٤',
    5: '٥',
    6: '٦',
    7: '٧',
    8: '٨',
    9: '٩',
  } as const,
} as const;

// Helper function to convert English numbers to Arabic-Indic numbers
export const toArabicNumbers = (text: string): string => {
  return text.replace(/[0-9]/g, (digit) => {
    const numKey = parseInt(digit) as keyof typeof ARABIC_TEXTS.NUMBERS;
    return ARABIC_TEXTS.NUMBERS[numKey] || digit;
  });
};

// Helper function to format Arabic text with proper spacing
export const formatArabicText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

// Common phrases for UI
export const UI_PHRASES = {
  EMPTY_STATE: 'لا توجد بيانات للعرض',
  COMING_SOON: 'قريباً',
  NOT_AVAILABLE: 'غير متاح',
  REQUIRED_FIELD: 'حقل مطلوب',
  INVALID_INPUT: 'مدخل غير صحيح',
  CONNECTION_LOST: 'انقطع الاتصال',
  RECONNECTING: 'جاري إعادة الاتصال...',
  OFFLINE_MODE: 'وضع عدم الاتصال',
  SYNC_REQUIRED: 'مطلوب مزامنة',
} as const;

export default ARABIC_TEXTS;