import { NextRequest, NextResponse } from 'next/server';
import { getReportById } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const report = await getReportById(id);
    
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }
    
    // 生成 HTML
    const html = generateReportHTML(report);
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Failed to generate report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}

function generateReportHTML(report: any): string {
  return `<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title>教育部学籍在线验证报告</title>
    <style>
        body {
            margin: 0;
            padding: 20px;
            font: 14px/1.8 "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "WenQuanYi Micro Hei", Arial, "sans-serif", SimSun;
        }

        .zxyz-res {
            width: 780px;
            height: 1104px;
            padding: 60px 92px 56px;
            box-sizing: border-box;
            margin: 0 auto;
            background: url("https://t4.chei.com.cn/chsi/images/xlcx2022.jpg") center center no-repeat;
            position: relative;
        }

        .zxyz-res h4 {
            font-size: 32px;
            font-weight: 700;
            color: #000000;
            line-height: 42px;
            text-align: center;
            padding: 15px 0 9px;
            margin: 0;
        }

        .zxyz-res .update-time {
            font-size: 14px;
            color: #999999;
            line-height: 20px;
            margin-bottom: 10px;
            text-align: center;
        }

        .zxyz-res .report-info-item {
            display: flex;
        }

        .zxyz-res .report-info-item .label {
            font-size: 14px;
            color: #4C4C4C;
            line-height: 22px;
            padding: 6px 0;
            text-align: left;
        }

        .zxyz-res .report-info-item .value {
            font-size: 14px;
            color: #000000;
            line-height: 22px;
            padding: 6px 0;
            width: 350px;
            text-align: left;
            word-break: break-word;
        }

        .zxyz-res .report-info-item .value.important {
            font-weight: 700;
            font-size: 16px;
            color: #000000;
        }

        .zxyz-res .report-info-item .value.long {
            flex: 1;
        }

        .zxyz-res .report-info {
            position: relative;
            padding-top: 16px;
        }

        .zxyz-res .r-zp-wrap {
            position: absolute;
            top: 18px;
            right: 0;
            width: 90px;
            height: 120px;
        }

        .zxyz-res .report-info-zp {
            max-width: 100%;
            max-height: 100%;
        }

        .zxyz-res .zxyz-res-bot {
            position: absolute;
            right: 50px;
            bottom: 40px;
        }

        .zxyz-res .zxyz-res-bot img {
            height: 26px;
        }

        .zxyz-res .zxyz-res-bottom {
            position: absolute;
            bottom: 50px;
            width: 596px;
        }

        .zxyz-res .zxyz-res-tip {
            text-align: left;
        }

        .zxyz-res .zxyz-res-tip-title {
            font-size: 12px;
            color: #000000;
            line-height: 20px;
            font-weight: 700;
            margin-bottom: 8px;
            height: auto;
            padding: 0;
        }

        .zxyz-res .zxyz-res-tip-content {
            font-size: 12px;
            color: #000000;
            line-height: 20px;
        }

        .zxyz-res .zxyz-res-code {
            margin-bottom: 24px;
            padding: 13px 23px;
            border-radius: 4px;
            font-size: 14px;
            border: 1px solid #34B099;
            display: flex;
        }

        .zxyz-res .zxyz-res-code .left {
            width: 100px;
            height: 100px;
            background: #fff;
            box-sizing: border-box;
            padding: 5px;
        }

        .zxyz-res .zxyz-res-code .right {
            color: #4C4C4C;
            line-height: 22px;
            padding-left: 15px;
        }

        .zxyz-res .zxyz-res-code .yzm {
            font-size: 20px;
            color: #000000;
            font-weight: 700;
        }

        .zxyz-res .zxyz-res-code .r_top {
            display: flex;
            padding: 11px 0 14px;
        }

        .zxyz-res .zxyz-res-code .text {
            margin-right: 8px;
            margin-top: 5px;
            line-height: 14px;
        }

        .zxyz-res .zxyz-res-code .xh {
            margin-right: 1px;
            vertical-align: 1px;
        }

        .zxyz-res.xj-zxyz-res .report-info-item .label {
            width: 100px;
        }

        img {
            border: 0;
        }
    </style>
</head>
<body>
    <div id="resultTable">
        <div class="zxyz-res xj-zxyz-res">
            <h4>教育部学籍在线验证报告</h4>
            <div class="update-time">更新日期:${report.update_date}</div>
            <div class="report-info">
                ${report.photo_url ? `
                <div class="r-zp-wrap">
                    <img src="${report.photo_url}" alt="" class="report-info-zp">
                </div>
                ` : ''}
                <div class="report-info-item">
                    <div class="label">Name</div>
                    <div class="value important">${report.name}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">Gender</div>
                    <div class="value">${report.gender}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">出生日期</div>
                    <div class="value">${report.birth_date}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">民族</div>
                    <div class="value">${report.ethnicity}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">Institution Name</div>
                    <div class="value long important">${report.institution_name}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">层次</div>
                    <div class="value long">${report.level}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">专业</div>
                    <div class="value long">${report.major}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">学制</div>
                    <div class="value long">${report.duration}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">学历类别</div>
                    <div class="value long">${report.education_type}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">学习形式</div>
                    <div class="value long">${report.learning_form}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">分院</div>
                    <div class="value long">${report.branch || ''}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">系所</div>
                    <div class="value long">${report.department || ''}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">Admission</div>
                    <div class="value long">${report.admission_date}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">学籍状态</div>
                    <div class="value long">${report.status}</div>
                </div>
                <div class="report-info-item">
                    <div class="label">Expected Graduation</div>
                    <div class="value long">${report.graduation_date}</div>
                </div>
            </div>
            <div class="zxyz-res-bottom">
                <div class="zxyz-res-code">
                    <div class="left">
                        ${report.qr_code_url ? `<img src="${report.qr_code_url}" width="90" class="bg_ewm">` : ''}
                    </div>
                    <div class="right">
                        <div class="r_top">
                            <span class="text">在线验证码</span> 
                            <span class="yzm">${report.verification_code}</span>
                        </div> 
                        <span class="xh">①</span>验证报告在线查验网址：https://www.chsi.com.cn/xlcx/bgcx.jsp<br>
                        <span class="xh">②</span>使用学信网App扫描二维码验证
                    </div>
                </div>
                <div class="zxyz-res-tip">
                    <h3 class="zxyz-res-tip-title">注意事项：</h3>
                    <div class="zxyz-res-tip-content">
                        1、《学籍在线验证报告》是教育部学籍电子注册备案的查询结果。<br>
                        2、报告内容如有修改，请以最新在线验证的内容为准。<br>
                        3、未经学籍信息权属人同意，不得将报告用于违背权属人意愿之用途。<br>
                        4、报告在线验证有效期由报告权属人设置（1~6个月），其在报告验证到期前可再次延长验证有效期。
                    </div>
                </div>
            </div>
            <div class="zxyz-res-bot">
                <img src="https://t1.chei.com.cn/chsi/images/logo.png" height="32">
            </div>
        </div>
    </div>
</body>
</html>`;
}
