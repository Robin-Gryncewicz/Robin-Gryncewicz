# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional
documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary
information to effectively respond to your bug report or contribution.


## Reporting Bugs/Feature Requests

We welcome you to use the GitHub issue tracker to report bugs or suggest features.

When filing an issue, please check existing open, or recently closed, issues to make sure somebody else hasn't already
reported the issue. Please try to include as much information as you can. Details like these are incredibly useful:

* A reproducible test case or series of steps
* The version of our code being used
* Any modifications you've made relevant to the bug
* Anything unusual about your environment or deployment


## Contributing via Pull Requests
Contributions via pull requests are much appreciated. Before sending us a pull request, please ensure that:

1. You are working against the latest source on the *main* branch.
2. You check existing open, and recently merged, pull requests to make sure someone else hasn't addressed the problem already.
3. You open an issue to discuss any significant work - we would hate for your time to be wasted.

To send us a pull request, please:

1. Fork the repository.
2. Modify the source; please focus on the specific change you are contributing. If you also reformat all the code, it will be hard for us to focus on your change.
3. Ensure local tests pass.
4. Commit to your fork using clear commit messages.
5. Send us a pull request, answering any default questions in the pull request interface.
6. Pay attention to any automated CI failures reported in the pull request, and stay involved in the conversation.

GitHub provides additional document on [forking a repository](https://help.github.com/articles/fork-a-repo/) and
[creating a pull request](https://help.github.com/articles/creating-a-pull-request/).


## Using AI Tools and GitHub Copilot

We welcome the use of AI-assisted development tools like GitHub Copilot to help with contributions. However, contributors must follow these guidelines:

### Requirements for AI-Assisted Contributions

1. **Human Review is Mandatory**:
   - You must thoroughly review and understand all AI-generated code before submitting
   - You are responsible for the quality, correctness, and security of your contributions
   - Be prepared to explain and defend any code you submit, regardless of how it was generated

2. **Testing is Required**:
   - All AI-generated code must include appropriate tests
   - Verify that existing tests still pass
   - Add new tests to cover edge cases and potential issues

3. **Declare AI Usage in PRs**:
   - Use the AI/Tooling disclosure section in the pull request template
   - Check the box indicating that AI tools were used
   - Briefly describe how AI assisted (e.g., "code generation", "refactoring", "test creation")
   - Add the `ai-assisted` label to your PR when AI tools contributed significantly

4. **Security Considerations**:
   - Never commit secrets, API keys, or sensitive information suggested by AI tools
   - Carefully review any security-related code (authentication, authorization, data validation)
   - Verify that dependencies suggested by AI are trustworthy and maintained
   - Run security checks before submitting

5. **Licensing Compliance**:
   - Ensure all AI-generated code complies with this repository's license
   - Review suggestions for originality and modify them to be transformative
   - Don't blindly accept large code blocks without understanding and modifying them
   - See the [LICENSE](LICENSE) file for our project's licensing terms

6. **Code Quality Standards**:
   - AI-generated code must follow the project's coding standards
   - Run linting and type checks: `npm run typecheck`
   - Ensure the code builds successfully: `npm run build`
   - Follow the patterns and conventions used in the existing codebase

### Labeling AI-Assisted PRs

When GitHub Copilot or other AI tools significantly contributed to your pull request:

1. Add the `ai-assisted` label to the PR
2. Use this label when:
   - AI generated substantial portions of the code
   - AI was used for complex logic or algorithms
   - Multiple files were created or modified with AI assistance
3. Don't use this label for minor AI suggestions (e.g., simple autocomplete)

### Getting Started with GitHub Copilot

If you want to use GitHub Copilot while contributing:
- Review the [COPILOT-SETUP.md](COPILOT-SETUP.md) guide for setup instructions
- Follow the best practices outlined in that document
- Join the conversation if you have questions about AI-assisted development

### Example PR Description with AI Disclosure

```markdown
## Description
Added email validation with domain verification feature.

## AI/Tooling Disclosure
- [x] AI tools were used to assist with this contribution
- How: GitHub Copilot generated initial validation regex patterns and test cases.
  I reviewed and modified the patterns to match our requirements and added 
  additional edge case tests.

Labels: ai-assisted
```

Remember: AI tools are aids to enhance your productivity, not replacements for understanding and craftsmanship. You own every line of code you submit.


## Finding contributions to work on
Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any 'help wanted' issues is a great place to start.


## Code of Conduct
This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
opensource-codeofconduct@amazon.com with any additional questions or comments.


## Security issue notifications
If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.


## Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.
