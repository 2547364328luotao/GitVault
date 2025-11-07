// 测试线上邮件 API
async function testOnlineEmail() {
  const url = 'https://gitvault-fvrdf2ay7-hutiancis-projects.vercel.app/api/emails';
  
  console.log('正在测试线上邮件 API...');
  console.log('URL:', url);
  
  try {
    const startTime = Date.now();
    const response = await fetch(url);
    const endTime = Date.now();
    
    console.log('\n响应状态:', response.status);
    console.log('响应时间:', (endTime - startTime) + 'ms');
    
    if (!response.ok) {
      const text = await response.text();
      console.log('错误响应:', text);
      return;
    }
    
    const emails = await response.json();
    
    console.log('\n邮件数量:', emails.length);
    
    if (emails.length > 0) {
      const firstEmail = emails[0];
      console.log('\n第一封邮件:');
      console.log('  ID:', firstEmail.id);
      console.log('  发件人:', firstEmail.from);
      console.log('  主题:', firstEmail.subject);
      console.log('  日期:', firstEmail.date);
      console.log('  有文本内容:', !!firstEmail.text);
      console.log('  有HTML内容:', !!firstEmail.html);
      console.log('  Snippet:', firstEmail.snippet?.substring(0, 50) + '...');
    }
  } catch (error) {
    console.error('错误:', error.message);
  }
}

testOnlineEmail();
