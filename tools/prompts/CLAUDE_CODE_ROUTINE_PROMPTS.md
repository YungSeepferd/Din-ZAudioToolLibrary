# Claude Code Routine Prompts Library

Reusable prompt templates based on prompt engineering best practices. Use these as-is or customize for your specific needs.

## Table of Contents

1. [Code Quality & Review](#code-quality--review)
2. [Audio Development](#audio-development)
3. [Documentation](#documentation)
4. [Testing & Debugging](#testing--debugging)
5. [Performance & Optimization](#performance--optimization)
6. [Refactoring & Improvements](#refactoring--improvements)
7. [Learning & Research](#learning--research)
8. [Project Management](#project-management)

---

## Code Quality & Review

### Prompt 1: Code Quality Audit

**Purpose**: Comprehensive code quality review with specific suggestions

**Best Practices Used**: Chain of Thought, Examples, XML Tags

```
I need a comprehensive code quality review for [COMPONENT/FILE].

Please analyze it for:

1. Code Standards Compliance
   - Check naming conventions (camelCase, PascalCase, UPPER_SNAKE_CASE)
   - Verify ESLint rules are followed
   - Ensure Prettier formatting is applied

2. Documentation Quality
   - File headers present and descriptive?
   - Functions documented with JSDoc?
   - Inline comments explain WHY, not WHAT?
   - Cross-references to other frameworks included?

3. Audio Patterns (if applicable)
   - Audio graph structure correct? (Source → Processing → Output)
   - Using AudioParam scheduling, not continuous updates?
   - Sample-accurate timing implemented?
   - Parameter ranges documented?

4. Error Handling
   - Input validation present?
   - Error messages helpful?
   - Graceful degradation implemented?

5. Performance
   - Any obvious inefficiencies?
   - Memory leaks possible?
   - Unnecessary re-renders (Svelte)?

Provide:
- Specific line numbers for issues
- Before/after code examples
- Priority level (critical, important, nice-to-have)
- Links to relevant documentation
```

**Expected Output**: Structured analysis with code examples and actionable items

---

### Prompt 2: Naming Convention Check

**Purpose**: Verify naming follows project standards

**Best Practices Used**: Clear Instructions, Examples, XML Tags

```
Review naming conventions in [FILE/DIRECTORY].

Use these standards:

<naming_conventions>
  <variables>camelCase - describe what it contains</variables>
  <functions>verb + noun - describe what it does</functions>
  <classes>PascalCase - represent objects/concepts</classes>
  <constants>UPPER_SNAKE_CASE - important fixed values</constants>
  <svelte_props>camelCase - descriptive names with types</svelte_props>
</naming_conventions>

Flag any violations and suggest fixes.

Example issues to find:
- Single letter variables (except loop counters)
- Unclear abbreviations (dt, x, val)
- Inconsistent naming style
- Functions that don't start with verbs

Provide before/after for each issue.
```

**Expected Output**: List of naming violations with corrections

---

### Prompt 3: Documentation Completeness Check

**Purpose**: Ensure documentation follows standards

**Best Practices Used**: XML Tags, Clear Requirements

```
Check documentation completeness for [FILE/MODULE].

Required documentation:

<documentation_requirements>
  <file_header>
    <purpose>What does this module do?</purpose>
    <exports>What does it export?</exports>
    <usage>How to use it?</usage>
    <dependencies>What does it depend on?</dependencies>
  </file_header>
  <functions>
    <summary>One-line description</summary>
    <params>All parameters documented</params>
    <returns>What it returns</returns>
    <example>Usage example</example>
    <cross_reference>Links to Pd, SC, or Web Audio equivalents</cross_reference>
  </functions>
  <algorithms>
    <theory>How it works mathematically</theory>
    <steps>Step-by-step process</steps>
    <visual>Signal flow diagram or pseudocode</visual>
  </algorithms>
</documentation_requirements>

Report missing sections and provide templates to fill them.
```

**Expected Output**: Missing documentation sections with templates

---

### Prompt 4: Code Review with Focus Areas

**Purpose**: Deep dive review on specific aspects

**Best Practices Used**: Chain of Thought, Examples, Focus Areas

```
Please review [FILE] with focus on:

1. **Correctness**
   - Does it do what it's supposed to?
   - Any edge cases handled?
   - Correct error handling?

2. **Maintainability**
   - Is it easy to understand?
   - Would a new developer get it?
   - Are complex parts explained?

3. **Performance**
   - Any obvious bottlenecks?
   - Unnecessary computations?
   - Memory efficient?

4. **Audio Specifics** (if applicable)
   - Correct Web Audio patterns?
   - Proper node connections?
   - Safe parameter ranges?
   - Avoiding audio clicks/pops?

For each issue found:
- Explain why it's a problem
- Show the current code
- Show the fixed code
- Explain why the fix works
```

**Expected Output**: Detailed review with explanations and fixes

---

## Audio Development

### Prompt 5: Audio Algorithm Implementation

**Purpose**: Implement an audio algorithm across frameworks

**Best Practices Used**: XML Tags, Examples, Chain of Thought

````
I want to implement a [ALGORITHM_NAME] effect.

Help me:

1. **Understand the Algorithm**
   - What is it? (Simple explanation)
   - How does it work? (Signal flow)
   - What parameters control it?

2. **Study Implementations**
   @puredata find patch for [ALGORITHM_NAME]
   @supercollider find UGen implementation for [ALGORITHM_NAME]
   Show how each framework implements it

3. **Web Audio Implementation**
   - Create a Web Audio version
   - Use the pattern: createEffect() function
   - Return object with: {input, output, setParam, connect}
   - Add comments explaining the algorithm

4. **Example Code**
   Show how to use it in a plugin:
   ```javascript
   const effect = create[ALGORITHM_NAME](param1, param2);
   oscillator.connect(effect.input);
   effect.connect(destination);
   effect.setParam1(newValue);
````

5. **Documentation**
   - Parameter ranges
   - Best practices
   - Cross-framework references
   - Links to resources

Start with theory, show implementations, then Web Audio code.

```

**Expected Output**: Complete algorithm implementation with documentation

---

### Prompt 6: Audio Testing Setup

**Purpose**: Create test suite for audio functionality

**Best Practices Used**: Examples, XML Tags, Chain of Thought

```

Create a test suite for [AUDIO_MODULE] that verifies:

<audio_test_requirements>
<initialization>
Can the module be created?
Does it initialize with correct defaults?
Does it handle invalid parameters?
</initialization>
<parameters>
Can parameters be changed?
Do values stay within range?
Are parameter changes applied correctly?
</parameters>
<connections>
Can nodes be connected properly?
Does audio flow correctly?
Can it be disconnected?
</connections>
<audio_output>
Does it produce sound?
Is the output level correct?
No clicks or pops?
</audio_output>
<edge_cases>
What if parameters are extreme?
What if nodes are connected multiple times?
What if disconnected before stopping?
</edge_cases>
</audio_test_requirements>

Provide:

- Test file structure
- Test cases for each requirement
- How to test audio output
- Debugging tips

```

**Expected Output**: Complete test suite with explanations

---

### Prompt 7: Cross-Framework Algorithm Comparison

**Purpose**: Compare algorithm implementations across frameworks

**Best Practices Used**: Comparison Tables, Examples, Chain of Thought

```

Compare how [ALGORITHM] is implemented across frameworks.

For each framework, show:

<comparison_template>
<framework>Name</framework>
<key_concepts>Main ideas and terminology</key_concepts>
<code_structure>How the code is organized</code_structure>
<parameters>What controls the effect</parameters>
<signal_flow>Input → Processing → Output</signal_flow>
<code_example>Working code snippet</code_example>
<notes>Framework-specific details</notes>
</comparison_template>

Include:

1. Pure Data patches
   @puredata find [ALGORITHM] implementation

2. SuperCollider code
   @supercollider show [ALGORITHM] UGen pattern

3. Web Audio implementation
   Show equivalent Web Audio code

4. Translation guide
   How to translate from Pd/SC to Web Audio

Highlight:

- Similarities across frameworks
- Key differences
- Why implementations differ
- Best practices from each

```

**Expected Output**: Side-by-side comparison with translation guide

---

## Documentation

### Prompt 8: API Documentation Generation

**Purpose**: Generate comprehensive API docs

**Best Practices Used**: XML Tags, Examples, Structure

```

Generate API documentation for [MODULE/CLASS].

Create documentation with these sections:

<api_documentation>
<overview>
One-paragraph summary of what it does
</overview>

  <installation>
    How to import/require it
    Any prerequisites?
  </installation>

<quick_start>
Minimal working example
Show basic usage
</quick_start>

  <functions>
    For each exported function:
    - Name and purpose
    - Parameters (type, description, range)
    - Return value (type, description)
    - Throws (what errors possible?)
    - Example usage
    - Related functions
  </functions>

  <properties>
    For each property:
    - Name and type
    - Description
    - Default value
    - Valid ranges
    - Setter/getter if applicable
  </properties>

  <examples>
    Multiple examples from simple to complex
    Show common use cases
  </examples>

<best_practices>
Do's and don'ts
Common mistakes
Performance tips
</best_practices>

<cross_references>
Related modules
Similar implementations in Pd/SC
External resources
</cross_references>
</api_documentation>

Format as markdown suitable for GitHub README.

```

**Expected Output**: Complete API documentation in markdown

---

### Prompt 9: Tutorial Creation

**Purpose**: Create learning tutorial for a feature

**Best Practices Used**: Examples, Chain of Thought, Progressive Complexity

```

Create a tutorial for learning [FEATURE/CONCEPT].

Structure it as:

1. **Understand the Concept**
   - What is it?
   - Why use it?
   - Real-world examples

2. **Prerequisites**
   - What should you know first?
   - Required reading/background
   - Assumed knowledge level

3. **Step-by-Step Guide**
   - 5-7 clear steps
   - Each with explanation
   - Code examples
   - Visual diagrams if applicable

4. **Try It Yourself**
   - Hands-on exercise
   - Expected results
   - How to verify it works

5. **Troubleshooting**
   - Common mistakes
   - How to debug
   - Where to get help

6. **Next Steps**
   - What to learn next?
   - Related concepts
   - Advanced variations

7. **Resources**
   - Links to documentation
   - Example code
   - Community references

Use:

- Progressive examples (simple → complex)
- Clear explanations before code
- Working code that readers can copy
- Diagrams for complex concepts

```

**Expected Output**: Complete tutorial with examples

---

## Testing & Debugging

### Prompt 10: Debugging Assistance

**Purpose**: Get systematic debugging help

**Best Practices Used**: Chain of Thought, XML Tags, Structured Analysis

```

I'm debugging [ISSUE_DESCRIPTION].

Please help me systematically:

1. **Understand the Problem**
   - What's the symptom?
   - When does it happen?
   - Is it consistent or intermittent?

2. **Gather Information**
   - Error message (if any)?
   - Browser console output?
   - Recent changes that might cause it?
   - Which browser/environment?

3. **Possible Causes**
   List likely causes in order of probability:
   - [ ] Cause 1
   - [ ] Cause 2
   - [ ] Cause 3

4. **Debugging Steps**
   For each possible cause:
   - How to test for it
   - What to look for
   - Tools/commands to use

5. **Solution**
   Once we identify the cause:
   - Explain why it happened
   - Show the fix
   - Explain why the fix works
   - How to prevent it next time

Provide:

- Debugging commands to run
- Console checks to perform
- Expected vs actual behavior
- Code fixes with explanations

```

**Expected Output**: Systematic debugging guide

---

### Prompt 11: Test Coverage Analysis

**Purpose**: Assess and improve test coverage

**Best Practices Used**: Analysis, Examples, Requirements

```

Analyze test coverage for [MODULE].

Check:

<coverage_analysis>
<statements> - Line coverage percentage - Which lines aren't tested? - Why are they hard to test?
</statements>

  <branches>
    - Branch coverage percentage
    - Which conditions aren't tested?
    - Edge cases covered?
  </branches>

  <functions>
    - Function coverage percentage
    - Which functions need tests?
    - Are error paths tested?
  </functions>

  <lines>
    - Line coverage percentage
    - Dead code?
    - Unused functions?
  </lines>
</coverage_analysis>

For low coverage areas:

- Why aren't they tested?
- Are they important to test?
- How to improve coverage?
- What tests should be added?

Provide:

- Coverage report interpretation
- List of critical untested areas
- New test suggestions
- Improved test suite structure

```

**Expected Output**: Coverage analysis with improvement suggestions

---

## Performance & Optimization

### Prompt 12: Performance Optimization

**Purpose**: Identify and fix performance issues

**Best Practices Used**: Analysis, Examples, Chain of Thought

```

I need to optimize [COMPONENT/FUNCTION] performance.

Please:

1. **Profile Current Performance**
   - What's slow?
   - How slow is it?
   - Where's the bottleneck?

2. **Identify Issues**
   Look for:
   - Unnecessary re-renders (Svelte)?
   - Inefficient algorithms?
   - Memory leaks?
   - Blocking operations?
   - DOM/Audio API calls in loops?
   - Non-optimized Web Audio parameters?

3. **Optimization Strategies**
   Provide 3-5 optimization approaches:
   - Strategy 1: [description]
     Pros: ...
     Cons: ...
     Expected improvement: ...
   - Strategy 2: [description]
     ...

4. **Recommended Solution**
   Show:
   - The best optimization for this case
   - Current code
   - Optimized code
   - Why it's better
   - Benchmark/metrics

5. **Prevention**
   How to avoid this in the future:
   - Patterns to use
   - Patterns to avoid
   - Best practices

Provide:

- Before/after code
- Specific improvements
- How to measure improvement
- Reusable optimization pattern

```

**Expected Output**: Optimized code with performance metrics

---

### Prompt 13: Audio Performance Optimization

**Purpose**: Optimize audio-specific performance

**Best Practices Used**: Specialized Knowledge, Examples, Analysis

```

Optimize audio performance in [AUDIO_MODULE].

Check for:

<audio_performance>
<cpu_usage> - Is the audio callback efficient? - Any expensive operations in real-time path? - Can processing move to separate thread?
</cpu_usage>

  <memory>
    - Memory leaks in audio graph?
    - Circular references in nodes?
    - Proper cleanup on stop?
  </memory>

  <latency>
    - Is latency acceptable?
    - Any blocking operations?
    - Can we reduce scheduling overhead?
  </latency>

  <artifacts>
    - Any clicks/pops/distortion?
    - Parameter ranges causing instability?
    - Proper ramping of automations?
  </artifacts>

<buffer_size> - Optimal buffer size? - Context sample rate matched? - Proper handling of buffer changes?
</buffer_size>
</audio_performance>

Provide:

- Current performance metrics
- Identified bottlenecks
- Optimization suggestions with code
- Expected improvement
- How to measure audio quality

```

**Expected Output**: Optimized audio code with performance analysis

---

## Refactoring & Improvements

### Prompt 14: Code Refactoring

**Purpose**: Improve code structure and maintainability

**Best Practices Used**: Analysis, Examples, Chain of Thought

```

Refactor [FILE/COMPONENT] to improve [ASPECT].

Current issues:

- [Issue 1]
- [Issue 2]
- [Issue 3]

Goals:

- [Goal 1]
- [Goal 2]

Refactoring strategy:

1. **Understand Current Code**
   - What does it do?
   - How is it structured?
   - What works well?
   - What doesn't?

2. **Design New Structure**
   - How should it be organized?
   - What functions/modules needed?
   - How should they interact?

3. **Step-by-Step Changes**
   - Change 1: [description]
     Before: [code]
     After: [code]
     Why: [explanation]
   - Change 2: ...

4. **Testing Strategy**
   - What tests confirm correctness?
   - How to verify no regressions?

5. **Final Code**
   Complete refactored code with:
   - Clear structure
   - Good documentation
   - Follows project standards

Constraints:

- No behavior changes
- Keep API compatible if external
- Improve readability and maintainability

```

**Expected Output**: Step-by-step refactoring guide with final code

---

### Prompt 15: Component Extraction

**Purpose**: Extract reusable components

**Best Practices Used**: Analysis, XML Tags, Examples

```

Extract reusable components from [CODE/FILE].

Identify:

<component_extraction>
<duplicated_logic> - Where is code repeated? - How many times? - Could it be extracted?
</duplicated_logic>

<reusable_patterns> - What patterns appear multiple times? - Could they be generalized? - What would parameterize them?
</reusable_patterns>

<new_components>
For each component to extract: - Name and purpose - Inputs (props/parameters) - Outputs/returns - Example usage - Documentation
</new_components>
</component_extraction>

For each component:

1. Show current duplicated code
2. Design the extracted component
3. Update callers to use it
4. Document the new component
5. Show how usage improves

Benefits:

- Reduced code duplication
- Better reusability
- Easier maintenance
- Clear separation of concerns

Provide:

- Component implementations
- Updated callers
- Usage documentation

```

**Expected Output**: New reusable components with refactored code

---

## Learning & Research

### Prompt 16: Learn a New Concept

**Purpose**: Understand a new technology or concept

**Best Practices Used**: Chain of Thought, Examples, Progressive Complexity

```

Help me learn [CONCEPT/TECHNOLOGY].

I have [BACKGROUND] knowledge.
I want to use it for [USE_CASE].

Please explain:

1. **High-Level Overview**
   - What is it?
   - Why does it matter?
   - Where is it used?

2. **Core Concepts**
   Key ideas to understand:
   - Concept 1: [explanation]
   - Concept 2: [explanation]
   - Concept 3: [explanation]

3. **How It Works**
   - Basic mechanism
   - Step-by-step process
   - Visual diagram if helpful

4. **Practical Examples**
   - Simple hello-world example
   - Real-world usage example
   - Example for my use case

5. **Common Patterns**
   - Best practices
   - What to avoid
   - Tips from experienced users

6. **Where to Learn More**
   - Official documentation
   - Tutorials
   - Community resources
   - Practice exercises

7. **Next Steps**
   - What to learn next?
   - Advanced topics
   - How to get proficient

Ask me if anything isn't clear. Explain simply without jargon.

```

**Expected Output**: Learning guide tailored to your level

---

### Prompt 17: Research Comparison

**Purpose**: Compare different approaches to a problem

**Best Practices Used**: Comparison Tables, Analysis, Examples

```

Compare [OPTION_A] vs [OPTION_B] for [USE_CASE].

Create a comparison table:

<comparison>
  <criteria>
    <criterion>Feature/Aspect</criterion>
    <option_a>How A handles it</option_a>
    <option_b>How B handles it</option_b>
    <analysis>Which is better and why?</analysis>
  </criteria>
</comparison>

Evaluate:

- Performance
- Ease of learning
- Documentation quality
- Community size
- Maintenance status
- Cost
- Integration with [YOUR_STACK]
- Scalability
- Features
- Drawbacks

For my specific use case [CONTEXT]:

- Which is better?
- Why?
- Any gotchas?

Provide:

- Detailed comparison table
- Pros/cons for each
- Recommendation with justification
- Examples of each approach
- Implementation guides

```

**Expected Output**: Detailed comparison with recommendation

---

## Project Management

### Prompt 18: Task Breakdown

**Purpose**: Break down large tasks into smaller steps

**Best Practices Used**: Structure, Chain of Thought, XML Tags

```

Help me break down [LARGE_TASK] into manageable steps.

Context:

- Current status: [STATUS]
- Timeline: [TIMEFRAME]
- Resources: [WHAT_YOU_HAVE]
- Constraints: [LIMITATIONS]

I need:

<task_breakdown>
<phases>
For each phase: - Clear outcome - Estimated time - Required skills - Dependencies - Success criteria
</phases>

  <tasks>
    For each task:
    - Clear description
    - Owner/responsibility
    - Due date
    - Dependencies
    - Deliverables
  </tasks>

  <milestones>
    Key checkpoints:
    - When?
    - What gets reviewed?
    - Decision points
  </milestones>
</task_breakdown>

Provide:

- Logical task sequence
- Time estimates for each
- Task dependencies diagram
- Risk areas
- Contingency plans
- Success metrics

```

**Expected Output**: Detailed project plan with tasks and timeline

---

### Prompt 19: Code Review Checklist

**Purpose**: Create comprehensive review checklist

**Best Practices Used**: Structure, Completeness, Examples

```

Create a code review checklist for [COMPONENT/FEATURE].

The checklist should verify:

1. **Functionality**
   - [ ] Does it do what it's supposed to?
   - [ ] Edge cases handled?
   - [ ] Error cases handled?

2. **Code Quality**
   - [ ] Follows naming conventions?
   - [ ] DRY principle applied?
   - [ ] Functions are small and focused?
   - [ ] No code duplication?

3. **Documentation**
   - [ ] File header present?
   - [ ] Functions documented with JSDoc?
   - [ ] Inline comments explain WHY?
   - [ ] Complex algorithms explained?

4. **Testing**
   - [ ] Tests written?
   - [ ] Edge cases tested?
   - [ ] Error paths tested?
   - [ ] Coverage adequate?

5. **Performance**
   - [ ] No obvious inefficiencies?
   - [ ] Proper use of Web Audio patterns?
   - [ ] No memory leaks?
   - [ ] Appropriate data structures?

6. **Security** (if applicable)
   - [ ] Input validation?
   - [ ] No hardcoded secrets?
   - [ ] Proper error handling?

7. **Audio Specifics** (if applicable)
   - [ ] Correct Web Audio patterns?
   - [ ] Proper parameter ranges?
   - [ ] Safe scheduling?
   - [ ] No audio artifacts?

For each item:

- Why it matters
- How to verify
- What to look for
- Common mistakes

Provide:

- Formatted checklist (markdown)
- Instructions for reviewers
- What warrants changes vs. suggestions

```

**Expected Output**: Comprehensive review checklist

---

### Prompt 20: Progress Report Generation

**Purpose**: Summarize work completed and progress made

**Best Practices Used**: Structure, Examples, Summary

```

Generate a progress report for [PROJECT/COMPONENT].

Report period: [START_DATE] to [END_DATE]

Include:

<progress_report>

  <summary>
    Executive summary (2-3 sentences)
    Key accomplishments
  </summary>

  <completed>
    Tasks finished this period:
    - Task 1: [description], [time spent]
    - Task 2: [description], [time spent]
  </completed>

<in_progress>
Current work: - Task 1: [description], [% complete] - Task 2: [description], [% complete]
</in_progress>

  <blocked>
    Any blockers?
    - Blocker 1: [description], [impact]
    - Blocker 2: [description], [impact]
  </blocked>

  <next>
    Planned for next period:
    - Task 1: [description], [estimate]
    - Task 2: [description], [estimate]
  </next>

  <metrics>
    Quantitative results:
    - Code quality: [before] → [after]
    - Test coverage: [before] → [after]
    - Performance: [metrics]
    - Bugs fixed: [count]
  </metrics>

  <risks>
    Potential issues:
    - Risk 1: [description], [mitigation]
    - Risk 2: [description], [mitigation]
  </risks>
</progress_report>

Make it suitable for stakeholders.

```

**Expected Output**: Formatted progress report

---

## Best Practices for Using These Prompts

### 1. **Customize for Your Needs**
- Replace `[PLACEHOLDER]` with your specific context
- Add or remove sections as needed
- Adjust complexity level based on your needs

### 2. **Combine Multiple Prompts**
- Use Prompt 5 (algorithm) + Prompt 16 (learn) for new features
- Use Prompt 2 (naming) + Prompt 4 (review) for code quality
- Use Prompt 10 (debugging) + Prompt 12 (optimization) for performance

### 3. **Use with MCP Servers**
Many prompts work better with specific servers:

```

@svelte @web-audio [Use Prompt 5 - Audio Algorithm Implementation]
@github [Use Prompt 18 - Task Breakdown]
@npm-registry [Use Prompt 17 - Research Comparison]

````

### 4. **Iterative Refinement**
- Start with basic prompt
- Ask clarifying questions
- Refine based on answers
- Get more detailed as needed

### 5. **Save Favorites**
Create a personal `.claude_prompts` file with your customized versions:

```bash
# Create prompts directory
mkdir -p .claude_prompts/

# Save frequently used prompts
echo "# [Prompt Name]
[Full prompt text]" > .claude_prompts/[name].md
````

### 6. **Template Variables**

Define these once for all prompts:

```
[PROJECT] = Audio Plugin Playground
[COMPONENT] = [Knob, Filter, Oscillator, etc.]
[FRAMEWORK] = [Svelte, Web Audio, Pure Data, SuperCollider]
[BACKGROUND] = [Your knowledge level]
```

---

## Example Workflow

**Scenario**: Building a new resonant filter component

```bash
# 1. Learn the concept (Prompt 16)
@web-audio @supercollider "Help me learn resonant filters"

# 2. Get algorithm comparison (Prompt 7)
"Compare resonant filter implementations in Pd, SC, and Web Audio"

# 3. Implement it (Prompt 5)
"Help me implement a resonant filter in Web Audio"

# 4. Create tests (Prompt 6)
"Create comprehensive tests for the filter module"

# 5. Document it (Prompt 8)
"Generate API documentation for the filter"

# 6. Code review (Prompt 4)
"Review the filter implementation for correctness and best practices"

# 7. Optimize (Prompt 12)
"Optimize audio performance of the filter"

# 8. Refactor if needed (Prompt 14)
"Refactor the filter code for better maintainability"

# 9. Progress update (Prompt 20)
"Generate a progress report on the filter implementation"
```

---

## Combining with MCP Servers

### Powerful Combinations

**Learning + Code Review**:

```
@svelte @web-audio
[Prompt 16 - Learn Concept] + [Prompt 4 - Code Review]
"Learn how to create responsive audio controls in Svelte AND review my implementation"
```

**Framework Comparison + Implementation**:

```
@puredata @supercollider @web-audio
[Prompt 7 - Framework Comparison] + [Prompt 5 - Implementation]
"Show me how [ALGORITHM] works in all three frameworks, then help me implement it in Web Audio"
```

**Git History + Refactoring**:

```
@github
[Prompt 18 - Task Breakdown] + [Prompt 14 - Refactoring]
"Analyze recent commits to this component, then plan a refactoring"
```

**Performance + Optimization**:

```
@npm-registry
[Prompt 12 - Performance Optimization] + [Prompt 13 - Audio Performance]
"Profile the audio module, suggest optimizations, and check if there are better libraries"
```

---

## Quick Reference

| Goal                  | Prompts to Use    |
| --------------------- | ----------------- |
| **Learn new topic**   | 16 + Research     |
| **Code review**       | 1, 2, 3, 4        |
| **Audio development** | 5, 6, 7, 13       |
| **Performance**       | 12, 13, Debugging |
| **Debugging**         | 10, 11            |
| **Documentation**     | 8, 9, API         |
| **Refactoring**       | 14, 15            |
| **Testing**           | 6, 11             |

---

## Tips for Best Results

1. **Be Specific**: The more context, the better the response
2. **Show Examples**: Provide current code for review prompts
3. **Clear Goals**: State what you want to achieve
4. **Use Structure**: Follow the prompt structure for consistency
5. **Iterate**: Refine based on responses
6. **Combine Tools**: Use MCP servers + prompts together
7. **Save Results**: Keep good responses for reference

---

See also:

- `CLAUDE_CODE_MCP_SETUP.md` - MCP server configuration
- `../docs/CODE_QUALITY_GUIDE.md` - Code standards
- `../docs/FRAMEWORKS_AND_TOOLS.md` - Framework integration
