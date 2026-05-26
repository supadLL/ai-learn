---
title: AI Play Curated Learning Sources
source: internal-curation
license: Original summaries by AI Play; external resources keep their own licenses
---

# Open and Linkable AI Learning Sources

## Hugging Face Course

The Hugging Face Course is useful for learning Transformer models, tokenizers, datasets, model fine-tuning, and common NLP workflows. It is a good candidate for bundled notes because the upstream repository uses the Apache-2.0 license.

Source: https://github.com/huggingface/course

## Prompt Engineering Guide

The Prompt Engineering Guide is useful for prompt patterns, retrieval-augmented generation, agent patterns, and research references. It is a good candidate for bundled summaries because the upstream repository uses the MIT license.

Source: https://github.com/dair-ai/Prompt-Engineering-Guide

## Dive into Deep Learning

Dive into Deep Learning is useful for neural network foundations, optimization, sequence models, attention, and Transformer concepts. Its book content uses a Creative Commons license, so bundled use needs attribution and license compliance.

Source: https://github.com/d2l-ai/d2l-en

## Machine Learning Systems

Machine Learning Systems is useful for deployment, model optimization, trustworthy systems, and the engineering side of AI applications. Its license has non-commercial and share-alike terms, so commercial packaging needs extra review.

Source: https://mlsysbook.ai/

## OpenAI Embeddings Documentation

OpenAI's embedding documentation is useful for explaining vectors, semantic search, clustering, recommendations, anomaly detection, and classification. It should be treated as linkable official documentation rather than bundled full-text content.

Source: https://platform.openai.com/docs/concepts

## Microsoft GraphRAG

Microsoft GraphRAG is useful for advanced RAG architecture: indexing, entity extraction, relationship extraction, community reports, and graph-enhanced retrieval. Treat the docs as a linkable architecture reference unless the documentation license is confirmed.

Source: https://microsoft.github.io/graphrag/index/overview/

## How to Use These Sources in AI Play

AI Play should not bundle large third-party books or documentation pages unless the license clearly allows redistribution. The safer default is to write original summaries, keep links to official sources, and preserve attribution and license notes.

For a beginner-friendly built-in knowledge base, prefer short original notes that answer learning questions directly:

- What problem does this concept solve?
- What does the simplest working version look like?
- What are the common mistakes?
- How does this concept connect to the rest of an AI application?
- What should a learner practice after reading it?

The internal notes in this directory follow that pattern. They are not copied from the linked sources; they are original AI Play curriculum notes designed to make the app useful even when offline.

## Suggested Expansion Topics

Future knowledge imports can add deeper notes for:

- Neural network basics: tensors, gradients, training loops, overfitting, validation.
- Transformer internals: attention, positional encoding, pretraining and instruction tuning.
- Retrieval engineering: BM25, dense retrieval, hybrid search, re-ranking, query rewriting.
- RAG operations: incremental indexing, document versioning, freshness, permissions, audit logs.
- Agent operations: tool permissions, sandboxing, durable execution, human approval.
- Evaluation practice: golden datasets, rubric design, regression testing, online feedback.
