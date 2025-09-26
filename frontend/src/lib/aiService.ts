import { LessonPlan, Worksheet, ParentUpdate, StudentData } from '@/types';

// Mock AI service that simulates content generation
export const aiService = {
  generateLessonPlan: async (subject: string, level: string, topic: string): Promise<Partial<LessonPlan>> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const objectives = [
      `Students will understand the concept of ${topic} in ${subject}`,
      `Students will be able to apply ${topic} concepts to solve problems`,
      `Students will demonstrate mastery through practice exercises`
    ];

    const practiceQuestions = [
      `Basic question about ${topic}: What is the definition of ${topic}?`,
      `Application question: How would you use ${topic} in a real-world scenario?`,
      `Problem-solving question: Solve this ${topic} problem step by step.`,
      `Critical thinking question: Compare and contrast different approaches to ${topic}.`,
      `Extension question: How does ${topic} relate to other concepts in ${subject}?`
    ];

    const suggestedAnswers = [
      `Answer 1: ${topic} is defined as... (detailed explanation)`,
      `Answer 2: In real-world applications, ${topic} can be used for... (examples)`,
      `Answer 3: Step-by-step solution: 1) First step... 2) Second step... 3) Final answer`,
      `Answer 4: Comparison shows that... (detailed analysis)`,
      `Answer 5: ${topic} connects to other concepts through... (relationships)`
    ];

    const content = `
# ${subject} Lesson Plan - ${topic}
## Level: ${level}

### Learning Objectives
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

### Lesson Structure
**Introduction (10 minutes)**
- Review previous concepts
- Introduce ${topic} with real-world examples
- Set learning goals for the lesson

**Main Content (25 minutes)**
- Explain key concepts of ${topic}
- Demonstrate problem-solving techniques
- Interactive examples and guided practice

**Practice & Assessment (15 minutes)**
- Individual practice questions
- Peer discussion and sharing
- Quick assessment of understanding

**Conclusion (5 minutes)**
- Summarize key points
- Preview next lesson
- Assign homework/extension activities

### Teaching Notes
- Use visual aids and manipulatives where appropriate
- Encourage student participation and questions
- Differentiate instruction for various ability levels
- Connect to MOE syllabus requirements for ${level}

### Resources Needed
- Whiteboard/projector
- Student worksheets
- Manipulatives (if applicable)
- Assessment rubric
    `;

    return {
      title: `${subject} - ${topic}`,
      subject,
      level,
      topic,
      content,
      objectives,
      practice_questions: practiceQuestions,
      suggested_answers: suggestedAnswers,
      export_format: 'pdf'
    };
  },

  generateWorksheet: async (subject: string, level: string, topic: string): Promise<Partial<Worksheet>> => {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const questions = [
      `Question 1: Define ${topic} and provide an example.`,
      `Question 2: Solve the following ${topic} problem: [Problem details here]`,
      `Question 3: Multiple choice - Which of the following best describes ${topic}? a) Option A b) Option B c) Option C d) Option D`,
      `Question 4: True or False - ${topic} is always applicable in ${subject}. Explain your answer.`,
      `Question 5: Application question - How would you use ${topic} to solve this real-world problem?`,
      `Question 6: Compare and contrast ${topic} with related concepts.`,
      `Question 7: Create your own example of ${topic} and explain your reasoning.`,
      `Question 8: Challenge question - Advanced application of ${topic} concepts.`
    ];

    const answerKey = [
      `Answer 1: ${topic} is defined as... Example: ...`,
      `Answer 2: Step-by-step solution with working shown`,
      `Answer 3: Correct answer is (c) with explanation`,
      `Answer 4: False/True - Detailed explanation of reasoning`,
      `Answer 5: Sample solution with methodology explained`,
      `Answer 6: Detailed comparison with key differences highlighted`,
      `Answer 7: Sample student response with evaluation criteria`,
      `Answer 8: Advanced solution with multiple approaches shown`
    ];

    const content = `
# ${subject} Worksheet - ${topic}
## Level: ${level}
## Name: _________________ Date: _________

### Instructions
- Read each question carefully
- Show all working where applicable
- Use the space provided for your answers
- Ask your teacher if you need clarification

### Questions
${questions.map((q, i) => `${i + 1}. ${q}\n\n_________________________________\n`).join('\n')}

### Reflection
What did you find most challenging about ${topic}?
_________________________________

What would you like to learn more about?
_________________________________

### Teacher Use Only
Score: _____ / ${questions.length}
Comments: _________________________________
    `;

    return {
      title: `${subject} Worksheet - ${topic}`,
      subject,
      level,
      topic,
      content,
      questions,
      answer_key: answerKey,
      export_format: 'pdf'
    };
  },

  generateParentUpdates: async (studentData: StudentData[], projectName: string): Promise<ParentUpdate[]> => {
    await new Promise(resolve => setTimeout(resolve, 2500));

    return studentData.map(student => {
      const score = typeof student.score === 'number' ? student.score : parseFloat(student.score.toString()) || 0;
      const grade = student.grade || (score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F');
      
      const strengths = student.strengths_observed ? [student.strengths_observed] : [
        score >= 80 ? 'Excellent understanding of concepts' : 'Shows good effort and participation',
        'Completes assignments on time',
        'Asks thoughtful questions'
      ];

      const improvements = student.areas_for_improvement ? [student.areas_for_improvement] : [
        score < 70 ? 'Needs more practice with problem-solving' : 'Could benefit from additional challenging exercises',
        'Should review homework more carefully',
        'Can improve attention to detail'
      ];

      const progressSummary = score >= 80 
        ? `${student.name} is performing excellently in ${student.subject}. They demonstrate strong understanding and consistently produce quality work.`
        : score >= 70
        ? `${student.name} is making good progress in ${student.subject}. They show solid understanding with room for continued growth.`
        : score >= 60
        ? `${student.name} is developing their skills in ${student.subject}. With continued effort, they can achieve better results.`
        : `${student.name} needs additional support in ${student.subject}. We're working together to strengthen their foundation.`;

      const nextSteps = score >= 80
        ? 'Continue with advanced practice and extension activities to maintain excellence.'
        : score >= 70
        ? 'Focus on consistent practice and review to build confidence and accuracy.'
        : 'Provide additional support at home with basic concepts and regular practice.';

      const draftText = `Dear Parent/Guardian,

I hope this message finds you well. I wanted to share an update on ${student.name}'s progress in ${student.subject}.

**Progress Summary:**
${progressSummary}

**Recent Assessment:**
${student.name} scored ${score}% (Grade ${grade}) on our recent ${student.assessment_type || 'assessment'}. 

**Strengths I've Observed:**
${strengths.map(s => `• ${s}`).join('\n')}

**Areas for Continued Growth:**
${improvements.map(i => `• ${i}`).join('\n')}

**Next Steps:**
${nextSteps}

${student.additional_comments ? `**Additional Notes:**\n${student.additional_comments}\n\n` : ''}Please feel free to reach out if you have any questions or would like to discuss ${student.name}'s progress further. I'm here to support their learning journey.

Best regards,
[Your Name]
[Your Contact Information]`;

      return {
        id: `${Date.now()}_${student.name}`,
        project_id: '', // Will be set when saving
        student_name: student.name,
        subject: student.subject,
        progress_summary: progressSummary,
        strengths,
        areas_for_improvement: improvements,
        next_steps: nextSteps,
        draft_text: draftText,
        created_date: new Date().toISOString(),
        last_modified_date: new Date().toISOString()
      };
    });
  }
};