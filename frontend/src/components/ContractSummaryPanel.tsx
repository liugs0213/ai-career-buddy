import React, { useState, useEffect } from 'react';
import './ContractSummaryPanel.css';

interface ContractSummaryPanelProps {
  userInput?: string;
  aiResponse?: string;
  className?: string;
  isFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

interface ContractKeyPoint {
  id: string;
  title: string;
  content: string;
  type: 'warning' | 'suggestion' | 'highlight' | 'info' | 'advantage' | 'disadvantage';
  icon: string;
}

interface ContractAnalysis {
  keyPoints: ContractKeyPoint[];
  advantages: string[];
  disadvantages: string[];
  riskLevel: 'low' | 'medium' | 'high';
  overallScore: number;
  recommendations: string[];
  contractType: string;
  riskExplanation: string;
  standardComparison: {
    salaryCompliance: string;
    benefitCoverage: string;
    legalCompliance: string;
  };
}

const ContractSummaryPanel: React.FC<ContractSummaryPanelProps> = ({
  userInput: _userInput = '',
  aiResponse = '',
  className = '',
  isFullscreen: externalIsFullscreen = false,
  onFullscreenChange
}) => {
  const [analysis, setAnalysis] = useState<ContractAnalysis>({
    keyPoints: [],
    advantages: [],
    disadvantages: [],
    riskLevel: 'low',
    overallScore: 0,
    recommendations: [],
    contractType: '劳动合同',
    riskExplanation: '',
    standardComparison: {
      salaryCompliance: '待分析',
      benefitCoverage: '待分析',
      legalCompliance: '待分析'
    }
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'advantages' | 'disadvantages' | 'risks'>('overview');
  const [internalIsFullscreen, setInternalIsFullscreen] = useState(false);
  const [showAllKeyPoints, setShowAllKeyPoints] = useState(false);
  
  // 使用外部控制的全屏状态，如果没有外部控制则使用内部状态
  const isFullscreen = onFullscreenChange ? externalIsFullscreen : internalIsFullscreen;
  const setIsFullscreen = onFullscreenChange ? onFullscreenChange : setInternalIsFullscreen;

  // 辅助函数：识别合同类型
  const identifyContractType = (aiResponse: string): string => {
    if (aiResponse.includes('实习') || aiResponse.includes('实习生')) return '实习协议';
    if (aiResponse.includes('兼职') || aiResponse.includes('临时工')) return '兼职合同';
    if (aiResponse.includes('试用期') || aiResponse.includes('正式员工')) return '正式劳动合同';
    if (aiResponse.includes('劳务') || aiResponse.includes('外包')) return '劳务合同';
    return '劳动合同';
  };

  // 辅助函数：生成风险说明
  const getRiskExplanation = (riskLevel: 'low' | 'medium' | 'high', disadvantages: string[]): string => {
    switch (riskLevel) {
      case 'high': 
        return `存在${disadvantages.length}项需要关注的风险点，建议仔细审查相关条款`;
      case 'medium': 
        return `存在${disadvantages.length}项需要注意的条款，建议关注细节`;
      case 'low': 
        return `风险较低，合同条款相对合理，仅有${disadvantages.length}项需要注意`;
      default: 
        return '';
    }
  };

  // 辅助函数：生成智能建议
  const generateRecommendations = (analysis: ContractAnalysis): string[] => {
    const recommendations: string[] = [];
    
    if (analysis.overallScore >= 80) {
      recommendations.push('建议定期审查合同条款变化');
      recommendations.push('可考虑协商更好的福利待遇');
      recommendations.push('建议了解公司发展前景');
      if (analysis.riskLevel === 'low') {
        recommendations.push('合同条件优越，建议尽快签署');
      }
    } else if (analysis.overallScore >= 60) {
      recommendations.push('建议仔细阅读合同细节');
      recommendations.push('可考虑协商部分条款');
      recommendations.push('建议咨询专业人士意见');
    } else {
      recommendations.push('强烈建议寻求专业法律咨询');
      recommendations.push('建议与HR详细沟通合同条款');
      recommendations.push('考虑寻找其他工作机会');
    }
    
    // 基于风险等级添加建议
    if (analysis.riskLevel === 'high') {
      recommendations.push('高风险合同，建议谨慎考虑');
      recommendations.push('建议详细记录所有风险点');
    }
    
    return recommendations;
  };

  // 辅助函数：与标准合同对比
  const compareWithStandard = (analysis: ContractAnalysis): { salaryCompliance: string; benefitCoverage: string; legalCompliance: string } => {
    let salaryCompliance = '待分析';
    let benefitCoverage = '待分析';
    let legalCompliance = '待分析';
    
    // 薪资合规性分析
    if (analysis.advantages.some(adv => adv.includes('薪资') || adv.includes('工资'))) {
      salaryCompliance = '符合市场标准';
    } else if (analysis.disadvantages.some(dis => dis.includes('薪资') || dis.includes('工资'))) {
      salaryCompliance = '低于市场标准';
    } else {
      salaryCompliance = '基本符合标准';
    }
    
    // 福利覆盖分析
    const benefitKeywords = ['社会保险', '公积金', '年假', '病假', '福利'];
    const hasBenefits = analysis.advantages.some(adv => benefitKeywords.some(keyword => adv.includes(keyword)));
    if (hasBenefits) {
      benefitCoverage = '福利覆盖完整';
    } else {
      benefitCoverage = '福利覆盖一般';
    }
    
    // 法律合规性分析
    const legalKeywords = ['劳动法', '劳动合同法', '试用期', '竞业限制'];
    const hasLegalCompliance = analysis.advantages.some(adv => legalKeywords.some(keyword => adv.includes(keyword)));
    if (hasLegalCompliance && analysis.riskLevel !== 'high') {
      legalCompliance = '符合劳动法规定';
    } else if (analysis.riskLevel === 'high') {
      legalCompliance = '存在法律风险';
    } else {
      legalCompliance = '基本符合规定';
    }
    
    return { salaryCompliance, benefitCoverage, legalCompliance };
  };

  // 辅助函数：修复风险等级计算
  const calculateRiskLevel = (riskScore: number, disadvantages: string[]): 'low' | 'medium' | 'high' => {
    // 修复风险等级计算逻辑
    if (riskScore <= 2 && disadvantages.length <= 2) return 'low';
    if (riskScore <= 5 && disadvantages.length <= 4) return 'medium';
    return 'high';
  };

  // 从AI回复中提取关键信息并进行全面分析
  useEffect(() => {
    const analyzeContract = (): ContractAnalysis => {
      const points: ContractKeyPoint[] = [];
      const advantages: string[] = [];
      const disadvantages: string[] = [];
      const recommendations: string[] = [];
      let riskScore = 0;
      let overallScore = 0;

      // 提取警告信息
      const warningMatches = aiResponse.match(/警惕[：:]([^。！？\n]+)/g);
      if (warningMatches) {
        warningMatches.forEach((match, index) => {
          const content = match.replace(/警惕[：:]/, '').trim();
          if (content) {
            points.push({
              id: `warning-${index}`,
              title: '⚠️ 风险提醒',
              content,
              type: 'warning',
              icon: '⚠️'
            });
            disadvantages.push(content);
            riskScore += 2;
          }
        });
      }

      // 提取建议信息
      const suggestionMatches = aiResponse.match(/建议[：:]([^。！？\n]+)/g);
      if (suggestionMatches) {
        suggestionMatches.forEach((match, index) => {
          const content = match.replace(/建议[：:]/, '').trim();
          if (content) {
            points.push({
              id: `suggestion-${index}`,
              title: '💡 专业建议',
              content,
              type: 'suggestion',
              icon: '💡'
            });
            recommendations.push(content);
          }
        });
      }

      // 提取重要信息 - 不重复显示"重点关注"标题
      const highlightMatches = aiResponse.match(/\*\*([^*]+)\*\*/g);
      if (highlightMatches) {
        highlightMatches.forEach((match, index) => {
          const content = match.replace(/\*\*/g, '').trim();
          if (content && content.length > 5 && content.length < 50) {
            points.push({
              id: `highlight-${index}`,
              title: '⭐ 重要信息',
              content,
              type: 'highlight',
              icon: '⭐'
            });
          }
        });
      }

      // 提取薪资信息 - 优化逻辑避免重复
      const salaryMatches = aiResponse.match(/(\d+[万千]?元?)/g);
      if (salaryMatches) {
        const uniqueSalaries = [...new Set(salaryMatches)];
        const salaryValues: number[] = [];
        
        uniqueSalaries.forEach((salary) => {
          if (salary.includes('万') || salary.includes('千') || salary.includes('元')) {
            const salaryNum = parseInt(salary.replace(/[万千元]/g, ''));
            let actualValue = salaryNum;
            
            // 统一转换为万元
            if (salary.includes('千')) {
              actualValue = salaryNum / 10; // 千元转万元
            }
            
            salaryValues.push(actualValue);
            
            // 只添加一次薪资信息到关键点
            if (salaryValues.length === 1) {
              points.push({
                id: 'salary-main',
                title: '💰 薪资信息',
                content: `薪资: ${salary}`,
                type: 'info',
                icon: '💰'
              });
            }
          }
        });
        
        // 基于所有薪资信息进行综合评估
        if (salaryValues.length > 0) {
          const avgSalary = salaryValues.reduce((sum, val) => sum + val, 0) / salaryValues.length;
          
          if (avgSalary >= 15) {
            advantages.push(`薪资水平较高: 平均${avgSalary.toFixed(1)}万元`);
            overallScore += 3; // 增加薪资优势的权重
          } else if (avgSalary < 10) {
            disadvantages.push(`薪资水平偏低: 平均${avgSalary.toFixed(1)}万元`);
            riskScore += 1;
          } else {
            // 中等薪资水平，不添加优势或劣势
            points.push({
              id: 'salary-assessment',
              title: '💰 薪资评估',
              content: `薪资水平中等: 平均${avgSalary.toFixed(1)}万元`,
              type: 'info',
              icon: '💰'
            });
            overallScore += 1; // 中等薪资也给一些分数
          }
        }
      }

      // 提取更多合同关键信息
      // 1. 提取试用期信息
      const probationMatches = aiResponse.match(/试用期[：:]?([^。！？\n]+)/g);
      if (probationMatches) {
        probationMatches.forEach((match, index) => {
          const content = match.replace(/试用期[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `probation-${index}`,
              title: '📅 试用期信息',
              content,
              type: 'info',
              icon: '📅'
            });
            overallScore += 1;
          }
        });
      }

      // 2. 提取工作地点信息
      const locationMatches = aiResponse.match(/工作地点[：:]?([^。！？\n]+)/g);
      if (locationMatches) {
        locationMatches.forEach((match, index) => {
          const content = match.replace(/工作地点[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `location-${index}`,
              title: '📍 工作地点',
              content,
              type: 'info',
              icon: '📍'
            });
            overallScore += 1;
          }
        });
      }

      // 3. 提取工作时间信息
      const workTimeMatches = aiResponse.match(/工作时间[：:]?([^。！？\n]+)/g);
      if (workTimeMatches) {
        workTimeMatches.forEach((match, index) => {
          const content = match.replace(/工作时间[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `worktime-${index}`,
              title: '⏰ 工作时间',
              content,
              type: 'info',
              icon: '⏰'
            });
            overallScore += 1;
          }
        });
      }

      // 4. 提取福利待遇信息
      const benefitMatches = aiResponse.match(/福利[：:]?([^。！？\n]+)/g);
      if (benefitMatches) {
        benefitMatches.forEach((match, index) => {
          const content = match.replace(/福利[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `benefit-${index}`,
              title: '🎁 福利待遇',
              content,
              type: 'advantage',
              icon: '🎁'
            });
            advantages.push(content);
            overallScore += 2;
          }
        });
      }

      // 5. 提取社会保险信息
      const insuranceMatches = aiResponse.match(/社会保险[：:]?([^。！？\n]+)/g);
      if (insuranceMatches) {
        insuranceMatches.forEach((match, index) => {
          const content = match.replace(/社会保险[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `insurance-${index}`,
              title: '🛡️ 社会保险',
              content,
              type: 'advantage',
              icon: '🛡️'
            });
            advantages.push(content);
            overallScore += 2;
          }
        });
      }

      // 6. 提取合同期限信息
      const contractTermMatches = aiResponse.match(/合同期限[：:]?([^。！？\n]+)/g);
      if (contractTermMatches) {
        contractTermMatches.forEach((match, index) => {
          const content = match.replace(/合同期限[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `contractterm-${index}`,
              title: '📋 合同期限',
              content,
              type: 'info',
              icon: '📋'
            });
            overallScore += 1;
          }
        });
      }

      // 7. 提取竞业限制信息
      const nonCompeteMatches = aiResponse.match(/竞业限制[：:]?([^。！？\n]+)/g);
      if (nonCompeteMatches) {
        nonCompeteMatches.forEach((match, index) => {
          const content = match.replace(/竞业限制[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `noncompete-${index}`,
              title: '🚫 竞业限制',
              content,
              type: 'warning',
              icon: '🚫'
            });
            disadvantages.push(content);
            riskScore += 2;
          }
        });
      }

      // 8. 提取保密协议信息
      const confidentialityMatches = aiResponse.match(/保密[：:]?([^。！？\n]+)/g);
      if (confidentialityMatches) {
        confidentialityMatches.forEach((match, index) => {
          const content = match.replace(/保密[：:]?/, '').trim();
          if (content) {
            points.push({
              id: `confidentiality-${index}`,
              title: '🔒 保密协议',
              content,
              type: 'info',
              icon: '🔒'
            });
            overallScore += 1;
          }
        });
      }

      // 提取公司信息
      const companyMatches = aiResponse.match(/([A-Za-z\u4e00-\u9fa5]+(?:科技|公司|集团|有限|股份))/g);
      if (companyMatches) {
        const uniqueCompanies = [...new Set(companyMatches)];
        uniqueCompanies.forEach((company, index) => {
          points.push({
            id: `company-${index}`,
            title: '🏢 公司信息',
            content: `公司: ${company}`,
            type: 'info',
            icon: '🏢'
          });
        });
      }

      // 提取优点信息 - 扩展关键词
      const advantageKeywords = ['优势', '优点', '好处', '有利', '保护', '保障', '福利', '待遇', '合理', '合法', '完善', '齐全', '充分', '到位'];
      advantageKeywords.forEach(keyword => {
        const regex = new RegExp(`${keyword}[：:]([^。！？\n]+)`, 'g');
        const matches = aiResponse.match(regex);
        if (matches) {
          matches.forEach(match => {
            const content = match.replace(new RegExp(`${keyword}[：:]`), '').trim();
            if (content && content.length > 3) {
              advantages.push(content);
              points.push({
                id: `advantage-${advantages.length}`,
                title: '✅ 合同优势',
                content,
                type: 'advantage',
                icon: '✅'
              });
              overallScore += 2; // 增加优势加分
            }
          });
        }
      });

      // 提取更多正面信息
      const positiveKeywords = ['符合', '满足', '达到', '超过', '标准', '规范', '完善', '齐全'];
      positiveKeywords.forEach(keyword => {
        const regex = new RegExp(`${keyword}[：:]?([^。！？\n]{10,50})`, 'g');
        const matches = aiResponse.match(regex);
        if (matches) {
          matches.forEach(match => {
            const content = match.replace(new RegExp(`${keyword}[：:]?`), '').trim();
            if (content && content.length > 5) {
              points.push({
                id: `positive-${Date.now()}-${Math.random()}`,
                title: '✅ 合规条款',
                content,
                type: 'advantage',
                icon: '✅'
              });
              advantages.push(content);
              overallScore += 1;
            }
          });
        }
      });

      // 提取缺点信息
      const disadvantageKeywords = ['风险', '问题', '不足', '缺陷', '限制', '约束', '不利'];
      disadvantageKeywords.forEach(keyword => {
        const regex = new RegExp(`${keyword}[：:]([^。！？\n]+)`, 'g');
        const matches = aiResponse.match(regex);
        if (matches) {
          matches.forEach(match => {
            const content = match.replace(new RegExp(`${keyword}[：:]`), '').trim();
            if (content && content.length > 3) {
              disadvantages.push(content);
              points.push({
                id: `disadvantage-${disadvantages.length}`,
                title: '❌ 合同劣势',
                content,
                type: 'disadvantage',
                icon: '❌'
              });
              riskScore += 1;
            }
          });
        }
      });

      // 计算风险等级 - 使用修复后的逻辑
      const riskLevel = calculateRiskLevel(riskScore, disadvantages);

      // 智能分析：如果提取的信息较少，基于AI回复内容进行推断
      if (points.length < 5) {
        // 基于AI回复长度和内容质量进行推断
        const responseLength = aiResponse.length;
        const hasDetailedAnalysis = responseLength > 500; // 回复较长说明分析详细
        const hasMultipleSections = (aiResponse.match(/[一二三四五六七八九十]、/g) || []).length > 0; // 有分点说明
        
        if (hasDetailedAnalysis) {
          points.push({
            id: 'analysis-quality',
            title: '📊 分析质量',
            content: 'AI提供了详细的分析内容',
            type: 'advantage',
            icon: '📊'
          });
          advantages.push('AI提供了详细的分析内容');
          overallScore += 3;
        }
        
        if (hasMultipleSections) {
          points.push({
            id: 'structured-analysis',
            title: '📋 结构化分析',
            content: '分析内容结构清晰，分点明确',
            type: 'advantage',
            icon: '📋'
          });
          advantages.push('分析内容结构清晰');
          overallScore += 2;
        }
        
        // 检查是否包含专业术语
        const professionalTerms = ['劳动合同法', '劳动法', '社会保险', '住房公积金', '试用期', '竞业限制', '保密协议'];
        const foundTerms = professionalTerms.filter(term => aiResponse.includes(term));
        if (foundTerms.length > 2) {
          points.push({
            id: 'professional-analysis',
            title: '⚖️ 专业分析',
            content: `涉及${foundTerms.length}个专业法律概念`,
            type: 'advantage',
            icon: '⚖️'
          });
          advantages.push('分析涉及专业法律概念');
          overallScore += 2;
        }
      }

      // 计算总体评分 (0-100) - 优化评分算法
      const baseScore = 70; // 提高基础分数
      const advantageBonus = advantages.length * 4; // 优势加分
      const disadvantagePenalty = disadvantages.length * 2; // 减少劣势扣分
      const riskPenalty = riskScore * 1.5; // 减少风险扣分
      const infoBonus = points.filter(p => p.type === 'info').length * 1; // 信息点加分
      
      overallScore = Math.max(0, Math.min(100, baseScore + advantageBonus - disadvantagePenalty - riskPenalty + infoBonus));

      // 生成基础分析结果
      const baseAnalysis = {
        keyPoints: points.slice(0, 10), // 限制显示数量
        advantages: [...new Set(advantages)], // 去重优势列表
        disadvantages: [...new Set(disadvantages)], // 去重劣势列表
        riskLevel,
        overallScore,
        recommendations: [...new Set(recommendations)] // 去重建议列表
      };

      // 生成智能建议
      const smartRecommendations = generateRecommendations({
        ...baseAnalysis,
        contractType: '',
        riskExplanation: '',
        standardComparison: { salaryCompliance: '', benefitCoverage: '', legalCompliance: '' }
      });
      
      // 生成风险说明
      const riskExplanation = getRiskExplanation(riskLevel, disadvantages);
      
      // 识别合同类型
      const contractType = identifyContractType(aiResponse);
      
      // 与标准合同对比
      const standardComparison = compareWithStandard({
        ...baseAnalysis,
        contractType: '',
        riskExplanation: '',
        standardComparison: { salaryCompliance: '', benefitCoverage: '', legalCompliance: '' }
      });

      return {
        ...baseAnalysis,
        recommendations: [...new Set([...baseAnalysis.recommendations, ...smartRecommendations])], // 合并建议
        contractType,
        riskExplanation,
        standardComparison
      };
    };

    const contractAnalysis = analyzeContract();
    setAnalysis(contractAnalysis);
  }, [aiResponse]);

  // 如果没有关键信息，显示默认提示
  if (analysis.keyPoints.length === 0) {
    return (
      <div className={`contract-summary-panel ${className}`}>
        <div className="panel-header">
          <div className="header-left">
            <span className="panel-icon">📋</span>
            <h3 className="panel-title">合同关键信息</h3>
          </div>
          <div className="header-actions">
            <button 
              className="action-btn fullscreen-btn"
              onClick={() => setIsFullscreen(true)}
              title="放大到全屏"
            >
              🔍 放大
            </button>
          </div>
        </div>
        
        <div className="panel-content">
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <p className="empty-text">上传劳动合同后，关键信息将自动提取并显示在这里</p>
            <div className="empty-tips">
              <h4>📋 合同分析功能</h4>
              <div className="feature-grid">
                <div className="feature-item">
                  <span className="feature-icon">💰</span>
                  <span className="feature-text">薪资分析</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⚠️</span>
                  <span className="feature-text">风险识别</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💡</span>
                  <span className="feature-text">专业建议</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span className="feature-text">综合评分</span>
                </div>
              </div>
              <div className="upload-guide">
                <h5>📤 如何上传合同：</h5>
                <ol>
                  <li>点击文档上传按钮</li>
                  <li>选择劳动合同文件（支持PDF、Word、图片）</li>
                  <li>等待AI自动分析</li>
                  <li>查看详细分析结果</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`contract-summary-panel ${className}`}>
      <div className="panel-header">
        <div className="header-left">
          <span className="panel-icon">📋</span>
          <h3 className="panel-title">合同关键信息</h3>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn fullscreen-btn"
            onClick={() => setIsFullscreen(true)}
            title="放大到全屏"
          >
            🔍 放大
          </button>
        </div>
      </div>
      
      <div className="panel-content">
        {/* 标签页导航 */}
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            概览
          </button>
          <button 
            className={`tab-btn ${activeTab === 'advantages' ? 'active' : ''}`}
            onClick={() => setActiveTab('advantages')}
          >
            优势 ({analysis.advantages.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'disadvantages' ? 'active' : ''}`}
            onClick={() => setActiveTab('disadvantages')}
          >
            风险 ({analysis.disadvantages.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
            onClick={() => setActiveTab('risks')}
          >
            风险等级: {analysis.riskLevel === 'high' ? '高' : analysis.riskLevel === 'medium' ? '中' : '低'}
          </button>
        </div>

        {/* 标签页内容 */}
        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="score-section">
                <div className="score-circle">
                  <span className="score-value">{analysis.overallScore}</span>
                  <span className="score-label">综合评分</span>
                </div>
                <div className="score-details">
                  <div className="score-item">
                    <span className="score-icon">✅</span>
                    <span>优势: {analysis.advantages.length}项</span>
                  </div>
                  <div className="score-item">
                    <span className="score-icon">❌</span>
                    <span>风险: {analysis.disadvantages.length}项</span>
                  </div>
                  <div className="score-item">
                    <span className="score-icon">💡</span>
                    <span>建议: {analysis.recommendations.length}项</span>
                  </div>
                </div>
              </div>
              
              {/* 整体评估 */}
              <div className="overall-assessment">
                <h4>📊 整体评估</h4>
                <div className="assessment-content">
                  <div className="assessment-summary">
                    <div className="assessment-text">
                      {analysis.overallScore >= 80 ? (
                        <span className="assessment-positive">
                          <span className="assessment-icon">🌟</span>
                          <span className="assessment-title">优秀合同</span>
                          <span className="assessment-desc">这是一份条件优越的劳动合同，薪资待遇合理，权益保障充分，风险较低。</span>
                        </span>
                      ) : analysis.overallScore >= 60 ? (
                        <span className="assessment-neutral">
                          <span className="assessment-icon">👍</span>
                          <span className="assessment-title">良好合同</span>
                          <span className="assessment-desc">这是一份条件良好的劳动合同，整体条款较为合理，建议关注部分细节。</span>
                        </span>
                      ) : analysis.overallScore >= 40 ? (
                        <span className="assessment-caution">
                          <span className="assessment-icon">⚠️</span>
                          <span className="assessment-title">需谨慎</span>
                          <span className="assessment-desc">这份合同存在一些需要关注的问题，建议仔细审查相关条款。</span>
                        </span>
                      ) : (
                        <span className="assessment-warning">
                          <span className="assessment-icon">🚨</span>
                          <span className="assessment-title">高风险合同</span>
                          <span className="assessment-desc">这份合同存在较多风险点，强烈建议谨慎考虑或寻求专业建议。</span>
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="assessment-details">
                    <div className="detail-item">
                      <span className="detail-label">合同类型</span>
                      <span className="detail-value">
                        📄 {analysis.contractType}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">风险等级</span>
                      <span className={`detail-value risk-${analysis.riskLevel}`}>
                        {analysis.riskLevel === 'high' ? '🔴 高' : analysis.riskLevel === 'medium' ? '🟡 中' : '🟢 低'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">建议关注</span>
                      <span className="detail-value">
                        {analysis.recommendations.length > 0 ? `${analysis.recommendations.length}项建议` : '无特殊建议'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">关键信息</span>
                      <span className="detail-value">
                        {analysis.keyPoints.length}项已识别
                      </span>
                    </div>
                  </div>
                  
                  {/* 风险说明 */}
                  {analysis.riskExplanation && (
                    <div className="risk-explanation">
                      <div className="risk-explanation-header">
                        <span className="risk-icon">⚠️</span>
                        <span className="risk-title">风险说明</span>
                      </div>
                      <div className="risk-explanation-content">
                        {analysis.riskExplanation}
                      </div>
                    </div>
                  )}
                  
                  {/* 标准对比 */}
                  <div className="standard-comparison">
                    <div className="comparison-header">
                      <span className="comparison-icon">📊</span>
                      <span className="comparison-title">标准对比</span>
                    </div>
                    <div className="comparison-items">
                      <div className="comparison-item">
                        <span className="comparison-label">薪资合规性</span>
                        <span className={`comparison-value ${analysis.standardComparison.salaryCompliance.includes('符合') ? 'good' : analysis.standardComparison.salaryCompliance.includes('低于') ? 'warning' : 'neutral'}`}>
                          {analysis.standardComparison.salaryCompliance}
                        </span>
                      </div>
                      <div className="comparison-item">
                        <span className="comparison-label">福利覆盖</span>
                        <span className={`comparison-value ${analysis.standardComparison.benefitCoverage.includes('完整') ? 'good' : 'neutral'}`}>
                          {analysis.standardComparison.benefitCoverage}
                        </span>
                      </div>
                      <div className="comparison-item">
                        <span className="comparison-label">法律合规</span>
                        <span className={`comparison-value ${analysis.standardComparison.legalCompliance.includes('符合') ? 'good' : analysis.standardComparison.legalCompliance.includes('风险') ? 'warning' : 'neutral'}`}>
                          {analysis.standardComparison.legalCompliance}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="key-points-preview">
                <div className="preview-header">
                  <h4>关键信息预览</h4>
                  {analysis.keyPoints.length > 3 && (
                    <button 
                      className="toggle-more-btn"
                      onClick={() => setShowAllKeyPoints(!showAllKeyPoints)}
                    >
                      {showAllKeyPoints ? '收起' : `查看全部 (${analysis.keyPoints.length}项)`}
                    </button>
                  )}
                </div>
                {(showAllKeyPoints ? analysis.keyPoints : analysis.keyPoints.slice(0, 3)).map((point) => (
                  <div key={point.id} className={`preview-point ${point.type}`}>
                    <span className="preview-icon">{point.icon}</span>
                    <span className="preview-content">{point.content}</span>
                  </div>
                ))}
                {!showAllKeyPoints && analysis.keyPoints.length > 3 && (
                  <div className="more-points">
                    还有 {analysis.keyPoints.length - 3} 项关键信息...
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'advantages' && (
            <div className="advantages-tab">
              {analysis.advantages.length > 0 ? (
                <div className="advantages-list">
                  {analysis.advantages.map((advantage, index) => (
                    <div key={index} className="advantage-item">
                      <span className="advantage-icon">✅</span>
                      <span className="advantage-text">{advantage}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-tab">
                  <span className="empty-icon">📝</span>
                  <p>暂无优势信息</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'disadvantages' && (
            <div className="disadvantages-tab">
              {analysis.disadvantages.length > 0 ? (
                <div className="disadvantages-list">
                  {analysis.disadvantages.map((disadvantage, index) => (
                    <div key={index} className="disadvantage-item">
                      <span className="disadvantage-icon">❌</span>
                      <span className="disadvantage-text">{disadvantage}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-tab">
                  <span className="empty-icon">🎉</span>
                  <p>暂无风险信息</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="risks-tab">
              <div className="risk-assessment">
                <div className={`risk-level ${analysis.riskLevel}`}>
                  <span className="risk-icon">
                    {analysis.riskLevel === 'high' ? '🔴' : analysis.riskLevel === 'medium' ? '🟡' : '🟢'}
                  </span>
                  <span className="risk-text">
                    风险等级: {analysis.riskLevel === 'high' ? '高' : analysis.riskLevel === 'medium' ? '中' : '低'}
                  </span>
                </div>
                
                {analysis.recommendations.length > 0 && (
                  <div className="recommendations-section">
                    <h4>💡 专业建议</h4>
                    <div className="recommendations-list">
                      {analysis.recommendations.map((recommendation, index) => (
                        <div key={index} className="recommendation-item">
                          <span className="recommendation-icon">💡</span>
                          <span className="recommendation-text">{recommendation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 全屏模态框 */}
      {isFullscreen && (
        <div className="visualization-fullscreen-modal" onClick={() => setIsFullscreen(false)}>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            <div className="fullscreen-header">
              <div className="header-left">
                <span className="panel-icon">📋</span>
                <h2 className="panel-title">合同关键信息</h2>
              </div>
              <div className="header-actions">
                <button 
                  className="action-btn close-btn"
                  onClick={() => setIsFullscreen(false)}
                  title="关闭全屏"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="fullscreen-body">
              {/* 标签页导航 */}
              <div className="tab-navigation">
                <button 
                  className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  概览
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'advantages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('advantages')}
                >
                  优势 ({analysis.advantages.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'disadvantages' ? 'active' : ''}`}
                  onClick={() => setActiveTab('disadvantages')}
                >
                  风险 ({analysis.disadvantages.length})
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'risks' ? 'active' : ''}`}
                  onClick={() => setActiveTab('risks')}
                >
                  风险等级: {analysis.riskLevel === 'high' ? '高' : analysis.riskLevel === 'medium' ? '中' : '低'}
                </button>
              </div>

              {/* 标签页内容 */}
              <div className="tab-content">
                {activeTab === 'overview' && (
                  <div className="overview-tab">
                    <div className="score-section">
                      <div className="score-circle">
                        <span className="score-value">{analysis.overallScore}</span>
                        <span className="score-label">综合评分</span>
                      </div>
                      <div className="score-details">
                        <div className="score-item">
                          <span className="score-icon">✅</span>
                          <span>优势: {analysis.advantages.length}项</span>
                        </div>
                        <div className="score-item">
                          <span className="score-icon">❌</span>
                          <span>风险: {analysis.disadvantages.length}项</span>
                        </div>
                        <div className="score-item">
                          <span className="score-icon">💡</span>
                          <span>建议: {analysis.recommendations.length}项</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 整体评估 */}
                    <div className="overall-assessment">
                      <h4>📊 整体评估</h4>
                      <div className="assessment-content">
                        <div className="assessment-summary">
                          <div className="assessment-text">
                            {analysis.overallScore >= 80 ? (
                              <span className="assessment-positive">
                                <span className="assessment-icon">🌟</span>
                                <span className="assessment-title">优秀合同</span>
                                <span className="assessment-desc">这是一份条件优越的劳动合同，薪资待遇合理，权益保障充分，风险较低。</span>
                              </span>
                            ) : analysis.overallScore >= 60 ? (
                              <span className="assessment-neutral">
                                <span className="assessment-icon">👍</span>
                                <span className="assessment-title">良好合同</span>
                                <span className="assessment-desc">这是一份条件良好的劳动合同，整体条款较为合理，建议关注部分细节。</span>
                              </span>
                            ) : analysis.overallScore >= 40 ? (
                              <span className="assessment-caution">
                                <span className="assessment-icon">⚠️</span>
                                <span className="assessment-title">需谨慎</span>
                                <span className="assessment-desc">这份合同存在一些需要关注的问题，建议仔细审查相关条款。</span>
                              </span>
                            ) : (
                              <span className="assessment-warning">
                                <span className="assessment-icon">🚨</span>
                                <span className="assessment-title">高风险合同</span>
                                <span className="assessment-desc">这份合同存在较多风险点，强烈建议谨慎考虑或寻求专业建议。</span>
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="assessment-details">
                          <div className="detail-item">
                            <span className="detail-label">风险等级</span>
                            <span className={`detail-value risk-${analysis.riskLevel}`}>
                              {analysis.riskLevel === 'high' ? '🔴 高' : analysis.riskLevel === 'medium' ? '🟡 中' : '🟢 低'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">建议关注</span>
                            <span className="detail-value">
                              {analysis.recommendations.length > 0 ? `${analysis.recommendations.length}项建议` : '无特殊建议'}
                            </span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">关键信息</span>
                            <span className="detail-value">
                              {analysis.keyPoints.length}项已识别
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="key-points-preview">
                      <h4>关键信息预览</h4>
                      {analysis.keyPoints.slice(0, 5).map((point) => (
                        <div key={point.id} className={`preview-point ${point.type}`}>
                          <span className="preview-icon">{point.icon}</span>
                          <span className="preview-content">{point.content}</span>
                        </div>
                      ))}
                      {analysis.keyPoints.length > 5 && (
                        <div className="more-points">
                          还有 {analysis.keyPoints.length - 5} 项关键信息...
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'advantages' && (
                  <div className="advantages-tab">
                    {analysis.advantages.length > 0 ? (
                      <div className="advantages-list">
                        {analysis.advantages.map((advantage, index) => (
                          <div key={index} className="advantage-item">
                            <span className="advantage-icon">✅</span>
                            <span className="advantage-text">{advantage}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <span className="empty-icon">📝</span>
                        <p>暂无优势信息</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'disadvantages' && (
                  <div className="disadvantages-tab">
                    {analysis.disadvantages.length > 0 ? (
                      <div className="disadvantages-list">
                        {analysis.disadvantages.map((disadvantage, index) => (
                          <div key={index} className="disadvantage-item">
                            <span className="disadvantage-icon">❌</span>
                            <span className="disadvantage-text">{disadvantage}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="empty-tab">
                        <span className="empty-icon">🎉</span>
                        <p>暂无风险信息</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'risks' && (
                  <div className="risks-tab">
                    <div className="risk-assessment">
                      <div className={`risk-level ${analysis.riskLevel}`}>
                        <span className="risk-icon">
                          {analysis.riskLevel === 'high' ? '🔴' : analysis.riskLevel === 'medium' ? '🟡' : '🟢'}
                        </span>
                        <span className="risk-text">
                          风险等级: {analysis.riskLevel === 'high' ? '高' : analysis.riskLevel === 'medium' ? '中' : '低'}
                        </span>
                      </div>
                      
                      {analysis.recommendations.length > 0 && (
                        <div className="recommendations-section">
                          <h4>💡 专业建议</h4>
                          <div className="recommendations-list">
                            {analysis.recommendations.map((recommendation, index) => (
                              <div key={index} className="recommendation-item">
                                <span className="recommendation-icon">💡</span>
                                <span className="recommendation-text">{recommendation}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractSummaryPanel;
