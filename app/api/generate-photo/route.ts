import { NextResponse } from 'next/server';

const BASE_URL = 'https://api-inference.modelscope.cn/';
const API_KEY = process.env.MODELSCOPE_API_KEY || 'ms-6c8062b8-ee2b-4df5-b2c9-fde51d71311c';

interface TaskResponse {
  task_id: string;
  task_status?: string;
  output_images?: string[];
}

/**
 * POST /api/generate-photo
 * 调用 ModelScope AI 生成证件照
 */
export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: '缺少 prompt 参数' },
        { status: 400 }
      );
    }

    // 第一步：提交生成任务
    const submitResponse = await fetch(`${BASE_URL}v1/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-ModelScope-Async-Mode': 'true',
      },
      body: JSON.stringify({
        model: 'DiffSynth-Studio/Qwen-Image-Edit-F2P',
        prompt: prompt,
      }),
    });

    if (!submitResponse.ok) {
      const error = await submitResponse.text();
      console.error('提交任务失败:', error);
      return NextResponse.json(
        { error: '提交图片生成任务失败' },
        { status: 500 }
      );
    }

    const submitData: TaskResponse = await submitResponse.json();
    const taskId = submitData.task_id;

    // 第二步：轮询任务状态 (最多等待 60 秒)
    const maxAttempts = 12; // 12次 * 5秒 = 60秒
    let attempts = 0;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 等待 5 秒

      const statusResponse = await fetch(`${BASE_URL}v1/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'X-ModelScope-Task-Type': 'image_generation',
        },
      });

      if (!statusResponse.ok) {
        console.error('查询任务状态失败');
        attempts++;
        continue;
      }

      const statusData: TaskResponse = await statusResponse.json();

      if (statusData.task_status === 'SUCCEED') {
        // 任务成功，返回图片 URL
        if (statusData.output_images && statusData.output_images.length > 0) {
          return NextResponse.json({
            success: true,
            imageUrl: statusData.output_images[0],
            taskId: taskId,
          });
        } else {
          return NextResponse.json(
            { error: '生成成功但未返回图片' },
            { status: 500 }
          );
        }
      } else if (statusData.task_status === 'FAILED') {
        return NextResponse.json(
          { error: '图片生成失败' },
          { status: 500 }
        );
      }

      // 任务还在进行中，继续轮询
      attempts++;
    }

    // 超时
    return NextResponse.json(
      { error: '图片生成超时，请稍后重试' },
      { status: 408 }
    );

  } catch (error) {
    console.error('生成证件照失败:', error);
    return NextResponse.json(
      { 
        error: '生成证件照失败', 
        message: error instanceof Error ? error.message : '未知错误' 
      },
      { status: 500 }
    );
  }
}
