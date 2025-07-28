const fs = require('fs');
const path = require('path');

// Файлы для исправления
const filesToFix = [
  'src/lib/services/messaging.ts',
  'src/lib/services/notifications.ts'
];

console.log('🔧 Fixing conversation_id → conversationId...\n');

filesToFix.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      console.log(`📝 Processing: ${filePath}`);
      
      let content = fs.readFileSync(filePath, 'utf8');
      let changesMade = 0;
      
      // Исправляем Query.equal
      const queryRegex = /Query\.equal\(['"]conversation_id['"],/g;
      content = content.replace(queryRegex, (match) => {
        changesMade++;
        return "Query.equal('conversationId',";
      });
      
      // Исправляем поля в интерфейсах
      const interfaceRegex = /conversation_id:\s*string/g;
      content = content.replace(interfaceRegex, (match) => {
        changesMade++;
        return "conversationId: string";
      });
      
      // Исправляем обращения к полям
      const fieldRegex = /messageData\.conversation_id/g;
      content = content.replace(fieldRegex, (match) => {
        changesMade++;
        return "messageData.conversationId";
      });
      
      // Исправляем создание объектов
      const objectRegex = /conversation_id:\s*conversationId/g;
      content = content.replace(objectRegex, (match) => {
        changesMade++;
        return "conversationId: conversationId";
      });
      
      if (changesMade > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`✅ Fixed ${changesMade} occurrences in ${filePath}`);
      } else {
        console.log(`➖ No changes needed in ${filePath}`);
      }
    } else {
      console.log(`⚠️ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
});

console.log('\n🎉 All conversation_id fields have been fixed!');
console.log('💡 Now restart your development server for changes to take effect.'); 